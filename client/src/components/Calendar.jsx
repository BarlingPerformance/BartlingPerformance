import { useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  addWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { colorFor } from '../utils/vehicleColors.js';
import { toDate, formatTime } from '../utils/dates.js';
import './Calendar.css';

function bookingOnDay(booking, day) {
  const start = toDate(booking.start_datetime);
  const end = toDate(booking.end_datetime);
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
  return start <= dayEnd && end >= dayStart;
}

export function Calendar({ bookings, vehiclesById, onSelectBooking }) {
  const [mode, setMode] = useState('month');
  const [anchor, setAnchor] = useState(new Date());

  const goPrev = () => setAnchor((d) => (mode === 'month' ? addMonths(d, -1) : addWeeks(d, -1)));
  const goNext = () => setAnchor((d) => (mode === 'month' ? addMonths(d, 1) : addWeeks(d, 1)));
  const goToday = () => setAnchor(new Date());

  const days = useMemo(() => {
    if (mode === 'month') {
      const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    const end = endOfWeek(anchor, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [mode, anchor]);

  const title =
    mode === 'month'
      ? format(anchor, 'MMMM yyyy', { locale: de })
      : `${format(days[0], 'd. MMM', { locale: de })} – ${format(days[6], 'd. MMM yyyy', { locale: de })}`;

  return (
    <section className="calendar card">
      <div className="calendar-header">
        <div className="calendar-title-row">
          <h2>Kalender</h2>
          <div className="calendar-nav">
            <button className="btn btn-ghost cal-nav-btn" onClick={goPrev} aria-label="Zurück">
              ‹
            </button>
            <button className="btn btn-ghost cal-today-btn" onClick={goToday}>
              Heute
            </button>
            <button className="btn btn-ghost cal-nav-btn" onClick={goNext} aria-label="Weiter">
              ›
            </button>
          </div>
        </div>
        <div className="calendar-controls">
          <span className="calendar-period">{title}</span>
          <div className="view-toggle">
            <button
              className={mode === 'week' ? 'active' : ''}
              onClick={() => setMode('week')}
            >
              Woche
            </button>
            <button
              className={mode === 'month' ? 'active' : ''}
              onClick={() => setMode('month')}
            >
              Monat
            </button>
          </div>
        </div>
      </div>

      <div className={`calendar-grid ${mode}`}>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
          <div className="weekday-label" key={d}>
            {d}
          </div>
        ))}
        {days.map((day) => {
          const dayBookings = bookings.filter((b) => bookingOnDay(b, day));
          const muted = mode === 'month' && !isSameMonth(day, anchor);
          return (
            <div
              className={`day-cell ${muted ? 'muted' : ''} ${isToday(day) ? 'today' : ''}`}
              key={day.toISOString()}
            >
              <span className="day-number">{format(day, 'd')}</span>
              <div className="day-events">
                {dayBookings.map((b) => {
                  const vehicle = vehiclesById[b.vehicle_id];
                  const c = colorFor(vehicle?.color_tag);
                  return (
                    <button
                      key={b.id}
                      className="day-event"
                      style={{ '--event-color': c.solid, '--event-soft': c.soft }}
                      onClick={() => onSelectBooking(b)}
                      title={`${vehicle?.name || ''} · ${b.renter_name}`}
                    >
                      <span className="event-dot" />
                      {mode === 'week' && (
                        <span className="event-time">{formatTime(b.start_datetime)}</span>
                      )}
                      <span className="event-label">{b.renter_name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        {Object.values(vehiclesById).map((v) => {
          const c = colorFor(v.color_tag);
          return (
            <div className="legend-item" key={v.id}>
              <span className="legend-dot" style={{ background: c.solid, boxShadow: `0 0 8px ${c.glow}` }} />
              {v.name}
            </div>
          );
        })}
      </div>
    </section>
  );
}
