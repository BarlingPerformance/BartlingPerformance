import express from 'express';
import cors from 'cors';
import './db.js';
import { vehiclesRouter } from './routes/vehicles.js';
import { bookingsRouter } from './routes/bookings.js';
import { documentsRouter } from './routes/documents.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/documents', documentsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Bartling Performance API läuft auf http://localhost:${PORT}`);
});
