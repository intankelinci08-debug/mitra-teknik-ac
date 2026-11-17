/* ============================================================
   Mitra Teknik Mandiri — Backend Worker Lengkap (FINAL FIX)
   ============================================================ */

const SECRET = 'mtm-secret-2026-ganti-kalau-perlu';
const TOKEN_HOURS = 8;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    if (method === 'OPTIONS') return new Response(null, { headers: cors });

    try {
      // ============ LOGIN ============
      if (path === '/api/login' && method === 'POST') {
        const { username, password } = await request.json();
        
        const { results } = await env.DB.prepare(
          'SELECT * FROM users WHERE username = ? AND password = ?'
        ).bind(username.toLowerCase(), password).all();

        if (results.length === 0) {
          return json({ error: 'Username atau Password salah' }, cors, 401);
        }

        const user = results[0];
        const token = await makeToken(user.role, TOKEN_HOURS, SECRET);
        
        return json({ token, role: user.role, name: user.name, expiresIn: TOKEN_HOURS * 3600 }, cors);
      }

      // ============ VERIFY ============
      if (path === '/api/verify' && method === 'GET') {
        const session = await requireAuth(request, SECRET);
        if (!session) return json({ valid: false }, cors, 401);
        return json({ valid: true, role: session.role }, cors);
      }

      // ============ TRACK BY PHONE (customer) - FIXED EXACT MATCH ============
      if (path === '/api/track' && method === 'GET') {
        const phone = url.searchParams.get('phone') || '';
        if (!phone) return json([], cors);
        const { results } = await env.DB.prepare(
          `SELECT id, service_type, ac_brand, status, assigned_tech,
                  preferred_date, cost, created_at
           FROM bookings WHERE phone = ? ORDER BY created_at DESC`
        ).bind(phone).all();
        return json(results.map(rowToTrack), cors);
      }

      // ============ CREATE BOOKING (customer) + EMAIL NOTIF ============
      if (path === '/api/bookings' && method === 'POST') {
        const b = await request.json();
        const id = b.id || 'MTM-' + Math.floor(1000 + Math.random() * 9000);
        
        // 1. Simpan ke Database D1
        await env.DB.prepare(`
          INSERT INTO bookings
          (id, customer_name, phone, address, ac_brand, service_type,
           preferred_date, notes, assigned_tech, status, tech_notes,
           cost, created_at, next_service_date, discount)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).bind(
          id, b.customerName, b.phone, b.address, b.acBrand, b.serviceType,
          b.preferredDate, b.notes || '',
          b.assignedTech || 'Belum Ditugaskan',
          b.status || 'Pending', b.techNotes || '',
          b.cost || 0,
          b.createdAt || new Date().toISOString(),
          b.nextServiceDate || null,
          b.discount || 0
        ).run();

        // 2. KIRIM NOTIFIKASI EMAIL (via Resend)
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Sistem MTM <onboarding@resend.dev>',
              to: ['intankelinci08@gmail.com'], // ⚠️⚠️ GANTI DENGAN EMAIL KAMU YANG TERDAFTAR DI RESEND ⚠️⚠️
              subject: `🔔 Booking Baru: ${id} - ${b.customerName}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                  <h2 style="color: #0284c7;">Ada Pesanan Servis AC Baru!</h2>
                  <p>Halo Admin, ada pesanan baru yang masuk ke sistem.</p>
                  <table style="width: 100%; text-align: left; margin-top: 15px;">
                    <tr><td><strong>Kode Booking</strong></td><td>: ${id}</td></tr>
                    <tr><td><strong>Nama Pelanggan</strong></td><td>: ${b.customerName}</td></tr>
                    <tr><td><strong>No HP</strong></td><td>: ${b.phone}</td></tr>
                    <tr><td><strong>Alamat</strong></td><td>: ${b.address}</td></tr>
                    <tr><td><strong>Layanan</strong></td><td>: ${b.serviceType} (${b.acBrand})</td></tr>
                    <tr><td><strong>Tanggal</strong></td><td>: ${b.preferredDate}</td></tr>
                    <tr><td><strong>Keluhan</strong></td><td>: ${b.notes || '-'}</td></tr>
                  </table>
                  <br>
                  <p>Silakan buka <a href="https://mitra-teknik.pages.dev">Dashboard Admin</a> untuk menugaskan teknisi.</p>
                </div>
              `
            })
          });
        } catch (error) {
          console.error('Gagal mengirim email:', error);
          // Error email tidak akan menggagalkan proses booking pelanggan
        }

        return json({ id, ...b }, cors, 201);
      }

      // ============ GET ALL BOOKINGS (auth) ============
      if (path === '/api/bookings' && method === 'GET') {
        const session = await requireAuth(request, SECRET);
        if (!session) return json({ error: 'Unauthorized' }, cors, 401);

        const { results } = await env.DB
          .prepare('SELECT * FROM bookings ORDER BY created_at DESC')
          .all();
        return json(results.map(rowToBooking), cors);
      }

      // ============ REMINDERS (admin only) ============
      if (path === '/api/reminders' && method === 'GET') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const { results } = await env.DB.prepare(
          `SELECT * FROM bookings
           WHERE status = 'Selesai'
             AND next_service_date IS NOT NULL
             AND next_service_date != ''
           ORDER BY next_service_date ASC`
        ).all();
        return json(results.map(rowToBooking), cors);
      }

      // ============ PATCH BOOKING (auth) ============
      const patch = path.match(/^\/api\/bookings\/([^/]+)$/);
      if (patch && method === 'PATCH') {
        const session = await requireAuth(request, SECRET);
        if (!session) return json({ error: 'Unauthorized' }, cors, 401);

        const id = patch[1];
        const body = await request.json();
        const map = {
          customerName:'customer_name', phone:'phone', address:'address',
          acBrand:'ac_brand', serviceType:'service_type',
          preferredDate:'preferred_date', notes:'notes',
          assignedTech:'assigned_tech', status:'status',
          techNotes:'tech_notes', cost:'cost',
          nextServiceDate:'next_service_date',
          discount:'discount'
        };
        const sets = [], vals = [];
        for (const [k, v] of Object.entries(body)) {
          if (map[k]) { sets.push(`${map[k]} = ?`); vals.push(v); }
        }
        if (sets.length) {
          vals.push(id);
          await env.DB.prepare(
            `UPDATE bookings SET ${sets.join(', ')} WHERE id = ?`
          ).bind(...vals).run();
        }
        return json({ ok: true }, cors);
      }

      // ============ DELETE BOOKING (admin) ============
      const del = path.match(/^\/api\/bookings\/([^/]+)$/);
      if (del && method === 'DELETE') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        await env.DB.prepare('DELETE FROM bookings WHERE id = ?')
          .bind(del[1]).run();
        return json({ ok: true }, cors);
      }

      // ============ GET ALL USERS (admin only) ============
      if (path === '/api/users' && method === 'GET') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const { results } = await env.DB.prepare(
          'SELECT id, username, role, name FROM users ORDER BY role ASC, name ASC'
        ).all();
        return json({ users: results }, cors);
      }

      // ============ POST NEW USER (admin only) ============
      if (path === '/api/users' && method === 'POST') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const b = await request.json();
        if (!b.username || !b.password || !b.name)
          return json({ error: 'Data tidak lengkap' }, cors, 400);

        try {
          await env.DB.prepare(
            'INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)'
          ).bind(b.username.toLowerCase(), b.password, b.role, b.name).run();
          return json({ ok: true }, cors, 201);
        } catch (e) {
          if (e.message.includes('UNIQUE')) return json({ error: 'Username sudah dipakai' }, cors, 400);
          throw e;
        }
      }

      // ============ PATCH USER (admin only) - FIXED DUPLICATE BUG ============
      // Blok PATCH ganda sudah dihapus, kini hanya ada satu blok yang lengkap
      if (path === '/api/users' && method === 'PATCH') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const { target_username, new_username, new_password, name, role } = await request.json();
        
        if (!target_username) {
          return json({ error: 'Target Username tidak ditemukan' }, cors, 400);
        }

        try {
          await env.DB.prepare(
            'UPDATE users SET username = ?, password = ?, name = ?, role = ? WHERE username = ?'
          ).bind(new_username.toLowerCase(), new_password, name, role, target_username.toLowerCase()).run();
          return json({ ok: true }, cors);
        } catch(e) {
          if (e.message.includes('UNIQUE')) {
             return json({ error: 'Username sudah dipakai' }, cors, 400);
          }
          return json({ error: e.message }, cors, 500);
        }
      }

      // ============ DELETE USER (admin only) ============
      const userDel = path.match(/^\/api\/users\/(\d+)$/);
      if (userDel && method === 'DELETE') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const userId = userDel[1];
        
        if (userId == '1') {
           return json({ error: 'Tidak bisa menghapus Admin Utama' }, cors, 400);
        }

        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
        return json({ ok: true }, cors);
      }

      // ============ GET TECHNICIANS (auth) ============
      if (path === '/api/technicians' && method === 'GET') {
        const session = await requireAuth(request, SECRET);
        if (!session) return json({ error: 'Unauthorized' }, cors, 401);

        const { results } = await env.DB.prepare(
          'SELECT id, name, specialty, phone FROM technicians WHERE active = 1 ORDER BY name ASC'
        ).all();
        return json({ technicians: results }, cors);
      }

      // ============ POST TECHNICIAN (admin) ============
      if (path === '/api/technicians' && method === 'POST') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const b = await request.json();
        if (!b.name || !b.name.trim())
          return json({ error: 'Nama teknisi wajib diisi' }, cors, 400);

        try {
          await env.DB.prepare(
            'INSERT INTO technicians (name, specialty, phone) VALUES (?,?,?)'
          ).bind(b.name.trim(), b.specialty || '', b.phone || '').run();
          return json({ ok: true }, cors, 201);
        } catch (e) {
          if (e.message.includes('UNIQUE'))
            return json({ error: 'Nama teknisi sudah ada' }, cors, 400);
          throw e;
        }
      }

      // ============ PATCH TECHNICIAN (admin) ============
      const techPatch = path.match(/^\/api\/technicians\/(\d+)$/);
      if (techPatch && method === 'PATCH') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const id = techPatch[1];
        const b = await request.json();
        const sets = [], vals = [];
        if (b.name !== undefined)      { sets.push('name = ?');      vals.push(b.name.trim()); }
        if (b.specialty !== undefined) { sets.push('specialty = ?'); vals.push(b.specialty); }
        if (b.phone !== undefined)     { sets.push('phone = ?');     vals.push(b.phone); }

        if (sets.length) {
          vals.push(id);
          await env.DB.prepare(
            `UPDATE technicians SET ${sets.join(', ')} WHERE id = ?`
          ).bind(...vals).run();
        }
        return json({ ok: true }, cors);
      }

      // ============ DELETE TECHNICIAN (soft delete, admin) ============
      const techDel = path.match(/^\/api\/technicians\/(\d+)$/);
      if (techDel && method === 'DELETE') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        await env.DB.prepare(
          'UPDATE technicians SET active = 0 WHERE id = ?'
        ).bind(techDel[1]).run();
        return json({ ok: true }, cors);
      }

      // ============ LAPORAN PENDAPATAN (admin only) - FIXED DOUBLE COUNT ============
      if (path === '/api/reports' && method === 'GET') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const month = url.searchParams.get('month');
        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
          return json({ error: 'Format bulan tidak valid (contoh: 2026-09)' }, cors, 400);
        }

        const { results } = await env.DB.prepare(
          `SELECT * FROM bookings
           WHERE status = 'Selesai'
             AND preferred_date LIKE ?`
        ).bind(month + '%').all();

        const bookings = results.map(rowToBooking);

        const totalGross    = bookings.reduce((sum, b) => sum + (Number(b.cost) || 0), 0);
        const totalDiscount = bookings.reduce((sum, b) => sum + (Number(b.discount) || 0), 0);
        const totalIncome   = totalGross - totalDiscount;
        const totalBookings = bookings.length;
        const avgPerBooking = totalBookings > 0 ? Math.round(totalIncome / totalBookings) : 0;

        const byTech = {};
        for (const b of bookings) {
          const tech = b.assignedTech || 'Belum Ditugaskan';
          if (!byTech[tech]) byTech[tech] = { tasks: 0, income: 0 };
          byTech[tech].tasks += 1;
          byTech[tech].income += Number(b.cost) || 0;
        }

        const byService = {};
        for (const b of bookings) {
          const srv = b.serviceType || 'Lainnya';
          if (!byService[srv]) byService[srv] = { count: 0, income: 0 };
          byService[srv].count += 1;
          byService[srv].income += Number(b.cost) || 0;
        }

        return json({
          month,
          summary: { totalIncome, totalGross, totalDiscount, totalBookings, avgPerBooking },
          byTechnician: Object.entries(byTech).map(([name, d]) => ({ name, ...d }))
                          .sort((a, b) => b.income - a.income),
          byService: Object.entries(byService).map(([name, d]) => ({ name, ...d }))
                          .sort((a, b) => b.income - a.income),
          bookings
        }, cors);
      }

      // ============ RESET (admin) ============
      if (path === '/api/bookings/reset' && method === 'POST') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        await env.DB.prepare('DELETE FROM bookings').run();
        return json({ ok: true }, cors);
      }
      
      // ============ GET SERVICES (public) ============
      if (path === '/api/services' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id, category, name, price, sort_order FROM services WHERE active = 1 ORDER BY sort_order ASC, id ASC'
        ).all();
        return json({ services: results }, cors);
      }

      // ============ POST SERVICE (admin) ============
      if (path === '/api/services' && method === 'POST') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const b = await request.json();
        if (!b.name || !b.name.trim())
          return json({ error: 'Nama layanan wajib diisi' }, cors, 400);
        if (!b.category || !b.category.trim())
          return json({ error: 'Kategori wajib diisi' }, cors, 400);

        await env.DB.prepare(
          'INSERT INTO services (category, name, price, sort_order) VALUES (?,?,?,?)'
        ).bind(
          b.category.trim(),
          b.name.trim(),
          Number(b.price) || 0,
          Number(b.sort_order) || 99
        ).run();
        return json({ ok: true }, cors, 201);
      }

      // ============ PATCH SERVICE (admin) ============
      const srvPatch = path.match(/^\/api\/services\/(\d+)$/);
      if (srvPatch && method === 'PATCH') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        const id = srvPatch[1];
        const b = await request.json();
        const sets = [], vals = [];
        if (b.category !== undefined)  { sets.push('category = ?');   vals.push(b.category.trim()); }
        if (b.name !== undefined)      { sets.push('name = ?');       vals.push(b.name.trim()); }
        if (b.price !== undefined)     { sets.push('price = ?');      vals.push(Number(b.price) || 0); }
        if (b.sort_order !== undefined){ sets.push('sort_order = ?'); vals.push(Number(b.sort_order) || 99); }

        if (sets.length) {
          vals.push(id);
          await env.DB.prepare(
            `UPDATE services SET ${sets.join(', ')} WHERE id = ?`
          ).bind(...vals).run();
        }
        return json({ ok: true }, cors);
      }

      // ============ DELETE SERVICE (soft delete, admin) ============
      const srvDel = path.match(/^\/api\/services\/(\d+)$/);
      if (srvDel && method === 'DELETE') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        await env.DB.prepare(
          'UPDATE services SET active = 0 WHERE id = ?'
        ).bind(srvDel[1]).run();
        return json({ ok: true }, cors);
      }

      // ============ SEED (admin) ============
      if (path === '/api/bookings/seed' && method === 'POST') {
        const session = await requireAuth(request, SECRET);
        if (!session || session.role !== 'admin')
          return json({ error: 'Unauthorized' }, cors, 401);

        await env.DB.prepare('DELETE FROM bookings').run();

        const fmt = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };
        const addDays = (n) => {
          const d = new Date();
          d.setDate(d.getDate() + n);
          return fmt(d);
        };
        const now = new Date().toISOString().slice(0,16).replace('T',' ');

        const seed = [
          ['MTM-1001','Ahmad Supardi','081298765432',
           'Jl. Bratasena V block BC 3 no 11 Pamulang','Daikin',
           'Cuci / Maintenance AC', addDays(1),'AC bocor air di unit indoor',
           'Teknisi Budi','Proses Pengerjaan',
           'Pembersihan outdoor & cek selang drainase.',150000, now, null, 0],
          ['MTM-1002','Siti Rahma','085712348899',
           'Jl. Pamulang Permai 1 Blok B2 No. 8','Panasonic',
           'Tambah / Isi Freon', addDays(2),'Angin kurang dingin',
           'Belum Ditugaskan','Pending','',0, now, null, 0],
          ['MTM-0999','Hendra Wijaya','081311223344',
           'Villa Pamulang Mas Blok D no 12','Sharp',
           'Cuci / Maintenance AC', addDays(-80),'Rutinitas 3 bulanan',
           'Teknisi Agus','Selesai',
           'Cuci indoor & outdoor, freon normal 80psi.',120000, now, addDays(10), 0],
          ['MTM-0998','Dewi Lestari','081234567001',
           'Jl. Surya Kencana No. 45, Pamulang','LG',
           'Cuci / Maintenance AC', addDays(-95),'Rutinitas',
           'Teknisi Budi','Selesai',
           'Pembersihan selesai, AC dingin kembali.',120000, now, addDays(-5), 0],
          ['MTM-0997','Rudi Hartono','081234567002',
           'Komp. Pamulang Elok Blok C7','Gree',
           'Cuci / Maintenance AC', addDays(-85),'Rutinitas 3 bulanan',
           'Teknisi Agus','Selesai',
           'Cuci indoor-outdoor, AC dingin kembali.',120000, now, addDays(5), 25000],
          ['MTM-0996','Sri Mulyani','081234567003',
           'Jl. Anggrek No. 12, Pamulang','Panasonic',
           'Cuci / Maintenance AC', addDays(-60),'Rutinitas 3 bulanan',
           'Teknisi Budi','Selesai',
           'Cuci selesai, kondisi normal.',120000, now, addDays(30), 0],
          ['MTM-0995','Bayu Pratama','081234567004',
           'Komp. Bukit Pamulang Indah Blok F5','Daikin',
           'Cuci / Maintenance AC', addDays(-30),'Rutinitas 3 bulanan',
           'Teknisi Agus','Selesai',
           'Cuci selesai, AC dingin.',120000, now, addDays(60), 0]
        ];

        for (const s of seed) {
          await env.DB.prepare(`
            INSERT INTO bookings
            (id, customer_name, phone, address, ac_brand, service_type,
             preferred_date, notes, assigned_tech, status, tech_notes,
             cost, created_at, next_service_date, discount)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          `).bind(...s).run();
        }
        return json({ ok: true }, cors);
      }

      return json({ error: 'Not found: ' + path }, cors, 404);
    } catch (e) {
      return json({ error: e.message }, cors, 500);
    }
  }
};

/* ============ HELPERS ============ */
function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

function rowToBooking(r) {
  return {
    id: r.id, customerName: r.customer_name, phone: r.phone,
    address: r.address, acBrand: r.ac_brand, serviceType: r.service_type,
    preferredDate: r.preferred_date, notes: r.notes,
    assignedTech: r.assigned_tech, status: r.status,
    techNotes: r.tech_notes, cost: r.cost, createdAt: r.created_at,
    nextServiceDate: r.next_service_date,
    discount: r.discount || 0
  };
}

function rowToTrack(r) {
  return {
    id: r.id, serviceType: r.service_type, acBrand: r.ac_brand,
    status: r.status, assignedTech: r.assigned_tech,
    preferredDate: r.preferred_date, cost: r.cost
  };
}

/* ============ AUTH ============ */
async function sign(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const bytes = new Uint8Array(sigBuf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function makeToken(role, hours, secret) {
  const exp = Date.now() + hours * 3600 * 1000;
  const payload = `${role}:${exp}`;
  const sig = await sign(payload, secret);
  return `${payload}:${sig}`;
}

async function verifyToken(token, secret) {
  if (!token) return null;
  const parts = token.split(':');
  if (parts.length !== 3) return null;
  const [role, exp, sig] = parts;
  if (Date.now() > parseInt(exp)) return null;
  const expected = await sign(`${role}:${exp}`, secret);
  if (sig !== expected) return null;
  return { role };
}

async function requireAuth(request, secret) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/, '');
  return await verifyToken(token, secret);
}