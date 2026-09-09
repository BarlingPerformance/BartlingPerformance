import { Router } from 'express';
import { db } from '../db.js';
import { generateContractPdf } from '../pdf/contract.js';
import { generateHandoverPdf } from '../pdf/handover.js';

export const documentsRouter = Router();

function loadBookingWithVehicle(id) {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) return null;
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(booking.vehicle_id);
  return { booking, vehicle };
}

documentsRouter.get('/:id/contract.pdf', async (req, res) => {
  const data = loadBookingWithVehicle(req.params.id);
  if (!data) return res.status(404).json({ error: 'Buchung nicht gefunden.' });

  const pdfBytes = await generateContractPdf(data);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Mietvertrag_${data.booking.renter_name.replace(/\s+/g, '_')}.pdf"`
  );
  res.send(Buffer.from(pdfBytes));
});

documentsRouter.get('/:id/handover.pdf', async (req, res) => {
  const data = loadBookingWithVehicle(req.params.id);
  if (!data) return res.status(404).json({ error: 'Buchung nicht gefunden.' });

  const pdfBytes = await generateHandoverPdf(data);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Uebergabeprotokoll_${data.booking.renter_name.replace(/\s+/g, '_')}.pdf"`
  );
  res.send(Buffer.from(pdfBytes));
});
