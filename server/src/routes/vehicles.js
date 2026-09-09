import { Router } from 'express';
import { db } from '../db.js';

export const vehiclesRouter = Router();

vehiclesRouter.get('/', (req, res) => {
  const vehicles = db.prepare('SELECT * FROM vehicles').all();
  res.json(vehicles);
});
