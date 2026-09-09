import { PDFDocument, StandardFonts } from 'pdf-lib';
import { COLORS, PAGE, drawHeader, drawFooter, formatDateTime } from './branding.js';

export async function generateHandoverPdf({ booking, vehicle }) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  let y = drawHeader(page, font, boldFont, 'Übergabeprotokoll');
  const { margin, width } = PAGE;
  const contentWidth = width - margin * 2;

  const sectionTitle = (text) => {
    page.drawText(text, { x: margin, y, size: 13, font: boldFont, color: COLORS.black });
    y -= 6;
    page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 1, color: COLORS.red });
    y -= 18;
  };

  const row = (label, value) => {
    page.drawText(label, { x: margin, y, size: 10, font: boldFont, color: COLORS.grayText });
    page.drawText(String(value ?? '-'), { x: margin + 180, y, size: 10, font, color: COLORS.black });
    y -= 18;
  };

  sectionTitle('Buchungsdaten');
  row('Fahrzeug:', vehicle.name);
  row('Mieter:', booking.renter_name);
  row('Führerscheinnummer:', booking.drivers_license_number);
  row('Telefonnummer:', booking.phone);
  row('Personalausweisnummer:', booking.id_card_number);
  row('Mietbeginn:', formatDateTime(booking.start_datetime));
  row('Mietende:', formatDateTime(booking.end_datetime));
  y -= 10;

  const drawInspectionBlock = (title) => {
    sectionTitle(title);

    const colWidth = contentWidth / 2 - 10;
    const fieldRow = (label, xOffset) => {
      page.drawText(label, { x: margin + xOffset, y, size: 9.5, font: boldFont, color: COLORS.grayText });
      page.drawLine({
        start: { x: margin + xOffset + 105, y: y - 2 },
        end: { x: margin + xOffset + colWidth, y: y - 2 },
        thickness: 0.75,
        color: COLORS.hairline,
      });
    };

    fieldRow('Datum / Uhrzeit:', 0);
    fieldRow('Kilometerstand:', colWidth + 20);
    y -= 24;
    fieldRow('Tankstand:', 0);
    fieldRow('Zustand außen:', colWidth + 20);
    y -= 24;
    fieldRow('Zustand innen:', 0);
    fieldRow('Vorhandenes Zubehör:', colWidth + 20);
    y -= 30;

    page.drawText('Bemerkungen / Schäden:', { x: margin, y, size: 9.5, font: boldFont, color: COLORS.grayText });
    y -= 16;
    for (let i = 0; i < 2; i++) {
      page.drawLine({
        start: { x: margin, y },
        end: { x: margin + contentWidth, y },
        thickness: 0.75,
        color: COLORS.hairline,
      });
      y -= 16;
    }
    y -= 10;
  };

  drawInspectionBlock('Zustand bei Übergabe');
  drawInspectionBlock('Zustand bei Rückgabe');

  sectionTitle('Unterschriften');

  const sigBlock = (label, xOffset, yBase) => {
    page.drawLine({
      start: { x: margin + xOffset, y: yBase },
      end: { x: margin + xOffset + 220, y: yBase },
      thickness: 0.75,
      color: COLORS.hairline,
    });
    page.drawText(label, { x: margin + xOffset, y: yBase - 14, size: 8.5, font, color: COLORS.lightGray });
  };

  const sigY1 = y - 30;
  sigBlock('Vermieter – Übergabe', 0, sigY1);
  sigBlock('Mieter – Übergabe', contentWidth - 220, sigY1);

  const sigY2 = sigY1 - 60;
  sigBlock('Vermieter – Rückgabe', 0, sigY2);
  sigBlock('Mieter – Rückgabe', contentWidth - 220, sigY2);

  const pages = pdfDoc.getPages();
  pages.forEach((p, idx) => drawFooter(p, font, idx + 1, pages.length));

  return pdfDoc.save();
}
