import { useState } from 'react';
import { Modal } from './Modal.jsx';
import { api } from '../api/client.js';
import { colorFor } from '../utils/vehicleColors.js';
import { formatDateTime, formatPrice } from '../utils/dates.js';
import './BookingDetailsModal.css';

export function BookingDetailsModal({ booking, vehicle, onClose, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const c = colorFor(vehicle?.color_tag);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteBooking(booking.id);
      onDeleted(booking.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal title="Buchungsdetails" onClose={onClose}>
      <div className="booking-details">
        <div className="detail-vehicle" style={{ '--v-color': c.solid, '--v-soft': c.soft }}>
          <span className="v-dot" />
          {vehicle?.name || 'Unbekanntes Fahrzeug'}
        </div>

        <div className="detail-grid">
          <div className="detail-row">
            <span className="detail-label">Zeitraum</span>
            <span className="detail-value">
              {formatDateTime(booking.start_datetime)} – {formatDateTime(booking.end_datetime)}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mieter</span>
            <span className="detail-value">{booking.renter_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Führerschein-Nr.</span>
            <span className="detail-value">{booking.drivers_license_number}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Telefon</span>
            <span className="detail-value">{booking.phone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Ausweis-Nr.</span>
            <span className="detail-value">{booking.id_card_number}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mietpreis</span>
            <span className="detail-value">{formatPrice(booking.price)}</span>
          </div>
          {booking.note && (
            <div className="detail-row">
              <span className="detail-label">Notiz</span>
              <span className="detail-value">{booking.note}</span>
            </div>
          )}
        </div>

        <div className="document-actions">
          <a className="btn btn-secondary" href={api.contractPdfUrl(booking.id)} target="_blank" rel="noreferrer">
            Vertrag erzeugen
          </a>
          <a className="btn btn-secondary" href={api.handoverPdfUrl(booking.id)} target="_blank" rel="noreferrer">
            Übergabeprotokoll erzeugen
          </a>
        </div>

        <div className="detail-footer-actions">
          <button className="btn btn-ghost" onClick={() => onEdit(booking)}>
            Bearbeiten
          </button>
          {!confirmDelete ? (
            <button className="btn btn-ghost danger" onClick={() => setConfirmDelete(true)}>
              Löschen
            </button>
          ) : (
            <div className="confirm-delete">
              <span>Wirklich löschen?</span>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                Nein
              </button>
              <button className="btn btn-primary danger-btn" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Löschen…' : 'Ja, löschen'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
