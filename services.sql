CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

DELETE FROM services;

INSERT INTO services (category, name, price, sort_order) VALUES
('Cuci & Maintenance', 'Cuci AC 0.5 – 2 PK', 85000, 1),
('Cuci & Maintenance', 'Cuci AC Inverter 0.5 – 2 PK', 130000, 2),
('Cuci & Maintenance', 'Cuci Besar / Overhaul', 170000, 3),
('Cuci & Maintenance', 'Vacuum & Flushing AC', 350000, 4),
('Cuci & Maintenance', 'Flushing Evaporator', 200000, 5),
('Cuci & Maintenance', 'Vacuum', 150000, 6),
('Tambah / Isi Freon', 'Tambah Freon R22 · 0.5 – 1 PK', 175000, 10),
('Tambah / Isi Freon', 'Tambah Freon R22 · 1.5 – 2 PK', 275000, 11),
('Tambah / Isi Freon', 'Tambah Freon R32/R410 · 0.5 – 1 PK', 225000, 12),
('Tambah / Isi Freon', 'Tambah Freon R32/R410 · 1.5 – 2 PK', 325000, 13),
('Tambah / Isi Freon', 'Isi Freon R22 · 0.5 – 1 PK', 300000, 14),
('Tambah / Isi Freon', 'Isi Freon R22 · 1.5 – 2 PK', 350000, 15),
('Tambah / Isi Freon', 'Isi Freon R32/R410 · 0.5 – 1 PK', 375000, 16),
('Tambah / Isi Freon', 'Isi Freon R32/R410 · 1.5 – 2 PK', 475000, 17),
('Bongkar Pasang', 'Bongkar AC', 175000, 20),
('Bongkar Pasang', 'Pasang AC 0.5 – 1 PK', 300000, 21),
('Bongkar Pasang', 'Pasang AC 1.5 – 2 PK', 375000, 22),
('Bongkar Pasang', 'Bongkar Pasang 0.5 – 1 PK', 450000, 23),
('Bongkar Pasang', 'Bongkar Pasang 1.5 – 2 PK', 500000, 24),
('Lainnya', 'Bobok Tembok per Meter', 50000, 30),
('Lainnya', 'Las Sambungan Pipa per Titik', 125000, 31),
('Lainnya', 'Biaya Pengecekan AC', 75000, 32);