import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';

export const bookingsRouter = Router();

const REQUIRED_FIELDS = [
  'vehicle_id',
  'start_datetime',
  'end_datetime',
  'renter_name',
  'drivers_license_number',
  'phone',
  'id_card_number',
  'price',
];

function validateBooking(body) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`Feld "${field}" ist erforderlich.`);
    }
  }
  if (body.start_datetime && body.end_datetime) {
    if (new Date(body.start_datetime) >= new Date(body.end_datetime)) {
      errors.push('"Bis" muss nach "Von" liegen.');
    }
  }
  if (body.price !== undefined && body.price !== '' && Number.isNaN(Number(body.price))) {
    errors.push('Mietpreis muss eine Zahl sein.');
  }
  return errors;
}

function findConflicts({ vehicle_id, start_datetime, end_datetime, excludeId }) {
  const query = `
    SELECT * FROM bookings
    WHERE vehicle_id = @vehicle_id
      AND id != @excludeId
      AND start_datetime < @end_datetime
      AND end_datetime > @start_datetime
  `;
  return db
    .prepare(query)
    .all({ vehicle_id, start_datetime, end_datetime, excludeId: excludeId ?? '' });
}

bookingsRouter.get('/', (req, res) => {
  const bookings = db
    .prepare('SELECT * FROM bookings ORDER BY start_datetime ASC')
    .all();
  res.json(bookings);
});

bookingsRouter.get('/:id', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Buchung nicht gefunden.' });
  res.json(booking);
});

// Explicit conflict-check endpoint used by the form before submission
bookingsRouter.post('/check-conflict', (req, res) => {
  const { vehicle_id, start_datetime, end_datetime, excludeId } = req.body;
  if (!vehicle_id || !start_datetime || !end_datetime) {
    return res.status(400).json({ error: 'vehicle_id, start_datetime und end_datetime erforderlich.' });
  }
  const conflicts = findConflicts({ vehicle_id, start_datetime, end_datetime, excludeId });
  res.json({ hasConflict: conflicts.length > 0, conflicts });
});

bookingsRouter.post('/', (req, res) => {
  const errors = validateBooking(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { vehicle_id, start_datetime, end_datetime } = req.body;
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicle_id);
  if (!vehicle) return res.status(400).json({ errors: ['Unbekanntes Fahrzeug.'] });

  const conflicts = findConflicts({ vehicle_id, start_datetime, end_datetime });
  if (conflicts.length > 0) {
    return res.status(409).json({ error: 'Fahrzeug ist im gewählten Zeitraum bereits gebucht.', conflicts });
  }

  const id = randomUUID();
  db.prepare(
    `INSERT INTO bookings
      (id, vehicle_id, start_datetime, end_datetime, renter_name, drivers_license_number, phone, id_card_number, price, note)
     VALUES (@id, @vehicle_id, @start_datetime, @end_datetime, @renter_name, @drivers_license_number, @phone, @id_card_number, @price, @note)`
  ).run({
    id,
    vehicle_id,
    start_datetime,
    end_datetime,
    renter_name: req.body.renter_name,
    drivers_license_number: req.body.drivers_license_number,
    phone: req.body.phone,
    id_card_number: req.body.id_card_number,
    price: Number(req.body.price),
    note: req.body.note || null,
  });

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  res.status(201).json(booking);
});

bookingsRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Buchung nicht gefunden.' });

  const errors = validateBooking(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { vehicle_id, start_datetime, end_datetime } = req.body;
  const conflicts = findConflicts({ vehicle_id, start_datetime, end_datetime, excludeId: req.params.id });
  if (conflicts.length > 0) {
    return res.status(409).json({ error: 'Fahrzeug ist im gewählten Zeitraum bereits gebucht.', conflicts });
  }

  db.prepare(
    `UPDATE bookings SET
      vehicle_id = @vehicle_id,
      start_datetime = @start_datetime,
      end_datetime = @end_datetime,
      renter_name = @renter_name,
      drivers_license_number = @drivers_license_number,
      phone = @phone,
      id_card_number = @id_card_number,
      price = @price,
      note = @note
     WHERE id = @id`
  ).run({
    id: req.params.id,
    vehicle_id,
    start_datetime,
    end_datetime,
    renter_name: req.body.renter_name,
    drivers_license_number: req.body.drivers_license_number,
    phone: req.body.phone,
    id_card_number: req.body.id_card_number,
    price: Number(req.body.price),
    note: req.body.note || null,
  });

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  res.json(booking);
});

bookingsRouter.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Buchung nicht gefunden.' });
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.status(204).end();
});
