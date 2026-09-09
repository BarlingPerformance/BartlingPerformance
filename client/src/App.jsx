import { useMemo, useState } from 'react';
import { Header } from './components/Header.jsx';
import { Calendar } from './components/Calendar.jsx';
import { VehicleOverview } from './components/VehicleOverview.jsx';
import { TomorrowList } from './components/TomorrowList.jsx';
import { NewRentalModal } from './components/NewRentalModal.jsx';
import { BookingDetailsModal } from './components/BookingDetailsModal.jsx';
import { useAppData } from './hooks/useAppData.js';
import './App.css';

export default function App() {
  const { vehicles, bookings, loading, error, refresh } = useAppData();
  const [showNewRental, setShowNewRental] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const vehiclesById = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, v])),
    [vehicles]
  );

  const handleCreated = () => {
    setShowNewRental(false);
    setEditingBooking(null);
    refresh();
  };

  const handleDeleted = () => {
    setSelectedBooking(null);
    refresh();
  };

  const openEdit = (booking) => {
    setSelectedBooking(null);
    setEditingBooking(booking);
  };

  return (
    <div className="app">
      <Header onNewRental={() => setShowNewRental(true)} />

      <main className="dashboard">
        {error && <div className="error-banner">Fehler beim Laden: {error}</div>}

        {loading ? (
          <div className="loading-state">Lade Daten…</div>
        ) : (
          <>
            <Calendar
              bookings={bookings}
              vehiclesById={vehiclesById}
              onSelectBooking={setSelectedBooking}
            />

            <section className="vehicle-overview-section">
              <h2 className="section-title">Fahrzeugübersicht</h2>
              <div className="vehicle-overview-grid">
                {vehicles.map((vehicle) => (
                  <VehicleOverview
                    key={vehicle.id}
                    vehicle={vehicle}
                    bookings={bookings}
                    onSelectBooking={setSelectedBooking}
                  />
                ))}
              </div>
            </section>

            <TomorrowList
              bookings={bookings}
              vehiclesById={vehiclesById}
              onSelectBooking={setSelectedBooking}
            />
          </>
        )}
      </main>

      {(showNewRental || editingBooking) && (
        <NewRentalModal
          vehicles={vehicles}
          existingBooking={editingBooking}
          onClose={() => {
            setShowNewRental(false);
            setEditingBooking(null);
          }}
          onCreated={handleCreated}
        />
      )}

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          vehicle={vehiclesById[selectedBooking.vehicle_id]}
          onClose={() => setSelectedBooking(null)}
          onEdit={openEdit}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
