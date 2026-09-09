import { useMemo, useState } from 'react';
import { Modal } from './Modal.jsx';
import { api } from '../api/client.js';
import { colorFor } from '../utils/vehicleColors.js';
import { formatDateTime } from '../utils/dates.js';
import './NewRentalModal.css';

const emptyForm = {
  vehicle_id: '',
  start_date: '',
  start_time: '',
  end_date: '',
  end_time: '',
  renter_name: '',
  drivers_license_number: '',
  phone: '',
  id_card_number: '',
  price: '',
  note: '',
};

function combine(date, time) {
  if (!date || !time) return '';
  return `${date}T${time}`;
}

export function NewRentalModal({ vehicles, onClose, onCreated, existingBooking }) {
  const isEdit = Boolean(existingBooking);
  const [form, setForm] = useState(() => {
    if (!existingBooking) return emptyForm;
    const [sd, st] = existingBooking.start_datetime.split('T');
    const [ed, et] = existingBooking.end_datetime.split('T');
    return {
      vehicle_id: existingBooking.vehicle_id,
      start_date: sd,
      start_time: (st || '').slice(0, 5),
      end_date: ed,
      end_time: (et || '').slice(0, 5),
      renter_name: existingBooking.renter_name,
      drivers_license_number: existingBooking.drivers_license_number,
      phone: existingBooking.phone,
      id_card_number: existingBooking.id_card_number,
      price: String(existingBooking.price),
      note: existingBooking.note || '',
    };
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [conflict, setConflict] = useState(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const startISO = combine(form.start_date, form.start_time);
  const endISO = combine(form.end_date, form.end_time);

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setSubmitError(null);
  };

  async function runConflictCheck(nextForm) {
    const vehicle_id = nextForm.vehicle_id;
    const start_datetime = combine(nextForm.start_date, nextForm.start_time);
    const end_datetime = combine(nextForm.end_date, nextForm.end_time);
    if (!vehicle_id || !start_datetime || !end_datetime) {
      setConflict(null);
      return;
    }
    setCheckingConflict(true);
    try {
      const result = await api.checkConflict({
        vehicle_id,
        start_datetime,
        end_datetime,
        excludeId: existingBooking?.id,
      });
      setConflict(result.hasConflict ? result.conflicts : null);
    } catch {
      setConflict(null);
    } finally {
      setCheckingConflict(false);
    }
  }

  const selectVehicle = (vehicleId) => {
    const next = { ...form, vehicle_id: vehicleId };
    setForm(next);
    runConflictCheck(next);
  };

  const handleDateTimeBlur = () => runConflictCheck(form);

  const validate = () => {
    const errors = {};
    if (!form.vehicle_id) errors.vehicle_id = 'Bitte Fahrzeug auswählen.';
    if (!form.start_date || !form.start_time) errors.start = 'Von-Datum/Uhrzeit erforderlich.';
    if (!form.end_date || !form.end_time) errors.end = 'Bis-Datum/Uhrzeit erforderlich.';
    if (startISO && endISO && new Date(startISO) >= new Date(endISO)) {
      errors.end = '"Bis" muss nach "Von" liegen.';
    }
    if (!form.renter_name.trim()) errors.renter_name = 'Name des Mieters erforderlich.';
    if (!form.drivers_license_number.trim())
      errors.drivers_license_number = 'Führerscheinnummer erforderlich.';
    if (!form.phone.trim()) errors.phone = 'Telefonnummer erforderlich.';
    if (!form.id_card_number.trim()) errors.id_card_number = 'Personalausweisnummer erforderlich.';
    if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) <= 0)
      errors.price = 'Gültigen Mietpreis angeben.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    await runConflictCheck(form);

    const payload = {
      vehicle_id: form.vehicle_id,
      start_datetime: startISO,
      end_datetime: endISO,
      renter_name: form.renter_name.trim(),
      drivers_license_number: form.drivers_license_number.trim(),
      phone: form.phone.trim(),
      id_card_number: form.id_card_number.trim(),
      price: Number(form.price),
      note: form.note.trim() || undefined,
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      const booking = isEdit
        ? await api.updateBooking(existingBooking.id, payload)
        : await api.createBooking(payload);
      onCreated(booking);
    } catch (err) {
      if (err.status === 409) {
        setConflict(err.payload?.conflicts || []);
        setSubmitError('Fahrzeug ist im gewählten Zeitraum bereits gebucht.');
      } else if (err.payload?.errors) {
        setSubmitError(err.payload.errors.join(' '));
      } else {
        setSubmitError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === form.vehicle_id),
    [vehicles, form.vehicle_id]
  );

  return (
    <Modal title={isEdit ? 'Vermietung bearbeiten' : 'Neue Vermietung'} onClose={onClose} wide>
      <form className="rental-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">Fahrzeug</label>
          <div className="vehicle-tiles">
            {vehicles.map((vehicle) => {
              const c = colorFor(vehicle.color_tag);
              const active = form.vehicle_id === vehicle.id;
              return (
                <button
                  type="button"
                  key={vehicle.id}
                  className={`vehicle-tile ${active ? 'active' : ''}`}
                  style={{
                    '--tile-color': c.solid,
                    '--tile-glow': c.glow,
                    '--tile-soft': c.soft,
                  }}
                  onClick={() => selectVehicle(vehicle.id)}
                >
                  <span className="tile-dot" />
                  {vehicle.name}
                </button>
              );
            })}
          </div>
          {fieldErrors.vehicle_id && <span className="field-error">{fieldErrors.vehicle_id}</span>}
        </div>

        <div className="form-grid">
          <div className="form-section">
            <label className="form-label">Von</label>
            <div className="datetime-row">
              <input
                type="date"
                value={form.start_date}
                onChange={update('start_date')}
                onBlur={handleDateTimeBlur}
              />
              <input
                type="time"
                value={form.start_time}
                onChange={update('start_time')}
                onBlur={handleDateTimeBlur}
              />
            </div>
            {fieldErrors.start && <span className="field-error">{fieldErrors.start}</span>}
          </div>

          <div className="form-section">
            <label className="form-label">Bis</label>
            <div className="datetime-row">
              <input
                type="date"
                value={form.end_date}
                onChange={update('end_date')}
                onBlur={handleDateTimeBlur}
              />
              <input
                type="time"
                value={form.end_time}
                onChange={update('end_time')}
                onBlur={handleDateTimeBlur}
              />
            </div>
            {fieldErrors.end && <span className="field-error">{fieldErrors.end}</span>}
          </div>
        </div>

        {checkingConflict && <div className="conflict-checking">Prüfe Verfügbarkeit…</div>}
        {conflict && conflict.length > 0 && (
          <div className="conflict-warning">
            <strong>{selectedVehicle?.name || 'Fahrzeug'} ist im gewählten Zeitraum bereits gebucht:</strong>
            <ul>
              {conflict.map((c) => (
                <li key={c.id}>
                  {c.renter_name}: {formatDateTime(c.start_datetime)} – {formatDateTime(c.end_datetime)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-grid">
          <div className="form-section">
            <label className="form-label">Name des Mieters</label>
            <input type="text" value={form.renter_name} onChange={update('renter_name')} />
            {fieldErrors.renter_name && <span className="field-error">{fieldErrors.renter_name}</span>}
          </div>
          <div className="form-section">
            <label className="form-label">Telefonnummer</label>
            <input type="tel" value={form.phone} onChange={update('phone')} />
            {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-section">
            <label className="form-label">Führerscheinnummer</label>
            <input
              type="text"
              value={form.drivers_license_number}
              onChange={update('drivers_license_number')}
            />
            {fieldErrors.drivers_license_number && (
              <span className="field-error">{fieldErrors.drivers_license_number}</span>
            )}
          </div>
          <div className="form-section">
            <label className="form-label">Personalausweisnummer</label>
            <input type="text" value={form.id_card_number} onChange={update('id_card_number')} />
            {fieldErrors.id_card_number && (
              <span className="field-error">{fieldErrors.id_card_number}</span>
            )}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-section">
            <label className="form-label">Mietpreis (€)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={update('price')} />
            {fieldErrors.price && <span className="field-error">{fieldErrors.price}</span>}
          </div>
          <div className="form-section">
            <label className="form-label">Notiz (optional)</label>
            <input type="text" value={form.note} onChange={update('note')} />
          </div>
        </div>

        {submitError && <div className="submit-error">{submitError}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Speichern…' : isEdit ? 'Änderungen speichern' : 'Vermietung anlegen'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
