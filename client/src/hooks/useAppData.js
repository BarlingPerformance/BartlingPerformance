import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function useAppData() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [vehiclesData, bookingsData] = await Promise.all([
        api.getVehicles(),
        api.getBookings(),
      ]);
      setVehicles(vehiclesData);
      setBookings(bookingsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vehicles, bookings, loading, error, refresh };
}
