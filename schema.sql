CREATE TABLE IF NOT EXISTS bookings (
  id            TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  address       TEXT NOT NULL,
  ac_brand      TEXT,
  service_type  TEXT,
  preferred_date TEXT,
  notes         TEXT,
  assigned_tech TEXT DEFAULT 'Belum Ditugaskan',
  status        TEXT DEFAULT 'Pending',
  tech_notes    TEXT DEFAULT '',
  cost          INTEGER DEFAULT 0,
  created_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_phone  ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_tech   ON bookings(assigned_tech);