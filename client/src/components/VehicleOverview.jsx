import { useMemo } from 'react';
import { colorFor } from '../utils/vehicleColors.js';
import { formatDateTime } from '../utils/dates.js';
import './VehicleOverview.css';

function computeVehicleState(bookings, vehicleId) {
  const now = new Date();
  const vehicleBookings = bookings
    .filter((b) => b.vehicle_id === vehicleId)
    .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

  const current = vehicleBookings.find(
    (b) => new Date(b.start_datetime) <= now && new Date(b.end_datetime) >= now
  );
  const upcoming = vehicleBookings.filter((b) => new Date(b.start_datetime) > now);

  return { current, upcoming, all: vehicleBookings };
}

export function VehicleOverview({ vehicle, bookings, onSelectBooking }) {
  const c = colorFor(vehicle.color_tag);
  const { current, upcoming } = useMemo(
    () => computeVehicleState(bookings, vehicle.id),
    [bookings, vehicle.id]
  );

  return (
    <div
      className="vehicle-card card"
      style={{ '--v-color': c.solid, '--v-glow': c.glow, '--v-soft': c.soft }}
    >
      <div className="vehicle-card-top">
        <div className="vehicle-name-row">
          <span className="v-dot-lg" />
          <h3>{vehicle.name}</h3>
        </div>
        <span className={`status-pill ${current ? 'busy' : 'free'}`}>
          {current ? 'Vermietet' : 'Verfügbar'}
        </span>
      </div>

      {current ? (
        <button className="vehicle-status-line" onClick={() => onSelectBooking(current)}>
          Vermietet bis <strong>{formatDateTime(current.end_datetime)}</strong> · {current.renter_name}
        </button>
      ) : (
        <p className="vehicle-status-line muted">Aktuell keine aktive Vermietung</p>
      )}

      <div className="vehicle-next">
        <span className="vehicle-next-label">Nächste Buchung</span>
        {upcoming.length > 0 ? (
          <button className="vehicle-next-value" onClick={() => onSelectBooking(upcoming[0])}>
            {formatDateTime(upcoming[0].start_datetime)} · {upcoming[0].renter_name}
          </button>
        ) : (
          <span className="vehicle-next-value muted">Keine anstehenden Buchungen</span>
        )}
      </div>

      {upcoming.length > 1 && (
        <div className="upcoming-list">
          <span className="upcoming-label">Kommende Buchungen</span>
          <ul>
            {upcoming.slice(1, 5).map((b) => (
              <li key={b.id}>
                <button onClick={() => onSelectBooking(b)}>
                  <span className="upcoming-date">{formatDateTime(b.start_datetime)}</span>
                  <span className="upcoming-name">{b.renter_name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
