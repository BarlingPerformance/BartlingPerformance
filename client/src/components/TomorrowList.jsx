import { useMemo } from 'react';
import { addDays } from 'date-fns';
import { colorFor } from '../utils/vehicleColors.js';
import { formatTime, toDate, isSameDay } from '../utils/dates.js';
import './TomorrowList.css';

export function TomorrowList({ bookings, vehiclesById, onSelectBooking }) {
  const items = useMemo(() => {
    const tomorrow = addDays(new Date(), 1);
    const result = [];
    for (const b of bookings) {
      const start = toDate(b.start_datetime);
      const end = toDate(b.end_datetime);
      if (isSameDay(start, tomorrow)) {
        result.push({ booking: b, type: 'handover', time: start });
      }
      if (isSameDay(end, tomorrow)) {
        result.push({ booking: b, type: 'return', time: end });
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }, [bookings]);

  return (
    <section className="tomorrow card">
      <h2>Was steht morgen an</h2>
      {items.length === 0 ? (
        <p className="tomorrow-empty">Für morgen sind keine Übergaben oder Rückgaben geplant.</p>
      ) : (
        <ul className="tomorrow-list">
          {items.map(({ booking, type, time }, idx) => {
            const vehicle = vehiclesById[booking.vehicle_id];
            const c = colorFor(vehicle?.color_tag);
            return (
              <li key={`${booking.id}-${type}-${idx}`}>
                <button
                  className="tomorrow-item"
                  style={{ '--v-color': c.solid, '--v-soft': c.soft }}
                  onClick={() => onSelectBooking(booking)}
                >
                  <span className="tomorrow-time">{formatTime(time)}</span>
                  <span className="tomorrow-vehicle-dot" />
                  <span className="tomorrow-info">
                    <span className="tomorrow-vehicle">{vehicle?.name}</span>
                    <span className="tomorrow-renter">{booking.renter_name}</span>
                  </span>
                  <span className={`tomorrow-type ${type}`}>
                    {type === 'handover' ? 'Übergabe' : 'Rückgabe'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
