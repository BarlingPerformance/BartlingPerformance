# Bartling Performance

Vermietungssoftware für "Bartling Performance" – Sportwagenvermietung (BMW M4 Competition xDrive, Audi RS3 Limousine).

Verwaltet Buchungen inkl. Konfliktprüfung, zeigt einen Kalender sowie eine Fahrzeugübersicht und generiert automatisch Mietvertrag und Übergabeprotokoll als PDF.

## Stack

- **Frontend:** React (Vite), reines CSS im dunklen Bartling-Performance-Look
- **Backend:** Node.js/Express, SQLite via `better-sqlite3`
- **PDF-Erzeugung:** `pdf-lib`

## Projektstruktur

```
server/   Express-API + SQLite-Datenbank + PDF-Generierung
client/   React-Frontend (Vite)
```

## Entwicklung starten

In zwei Terminals:

```bash
# Backend (Port 4000)
cd server
npm install
npm run dev

# Frontend (Port 5173, proxied /api -> Backend)
cd client
npm install
npm run dev
```

Anschließend die App unter http://localhost:5173 öffnen.

## API (Auszug)

- `GET /api/vehicles` – Fahrzeuge
- `GET /api/bookings` – alle Buchungen
- `POST /api/bookings` – neue Buchung (mit Konfliktprüfung, Antwort `409` bei Überschneidung)
- `POST /api/bookings/check-conflict` – Verfügbarkeit prüfen, ohne zu speichern
- `PUT /api/bookings/:id` / `DELETE /api/bookings/:id`
- `GET /api/documents/:id/contract.pdf` – Mietvertrag als PDF
- `GET /api/documents/:id/handover.pdf` – Übergabeprotokoll als PDF

## Datenmodell

```
Vehicle: id, name, color_tag (blue/red)
Booking: id, vehicle_id, start_datetime, end_datetime, renter_name,
         drivers_license_number, phone, id_card_number, price, note
```

Die beiden Fahrzeuge (BMW M4 Competition xDrive, Audi RS3 Limousine) werden beim ersten Start automatisch angelegt.
