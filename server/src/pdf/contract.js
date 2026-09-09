import { PDFDocument, StandardFonts } from 'pdf-lib';
import { COLORS, PAGE, drawHeader, drawFooter, formatDateTime, formatPrice } from './branding.js';

function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateContractPdf({ booking, vehicle }) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  let y = drawHeader(page, font, boldFont, 'Mietvertrag');
  const { margin, width } = PAGE;
  const contentWidth = width - margin * 2;

  const contractNumber = booking.id.slice(0, 8).toUpperCase();
  const issuedOn = new Date().toLocaleDateString('de-DE');

  const sectionTitle = (text) => {
    page.drawText(text, { x: margin, y, size: 13, font: boldFont, color: COLORS.black });
    y -= 6;
    page.drawLine({
      start: { x: margin, y },
      end: { x: margin + contentWidth, y },
      thickness: 1,
      color: COLORS.red,
    });
    y -= 18;
  };

  const row = (label, value) => {
    page.drawText(label, { x: margin, y, size: 10, font: boldFont, color: COLORS.grayText });
    page.drawText(String(value ?? '-'), { x: margin + 180, y, size: 10, font, color: COLORS.black });
    y -= 18;
  };

  const paragraph = (text) => {
    const lines = wrapText(text, font, 9.5, contentWidth);
    for (const line of lines) {
      page.drawText(line, { x: margin, y, size: 9.5, font, color: COLORS.grayText });
      y -= 13;
    }
    y -= 6;
  };

  page.drawText(`Vertragsnummer: ${contractNumber}`, { x: margin, y, size: 9, font, color: COLORS.lightGray });
  page.drawText(`Ausgestellt am: ${issuedOn}`, {
    x: margin + contentWidth - font.widthOfTextAtSize(`Ausgestellt am: ${issuedOn}`, 9),
    y,
    size: 9,
    font,
    color: COLORS.lightGray,
  });
  y -= 28;

  sectionTitle('Vertragsparteien');
  row('Vermieter:', 'Bartling Performance');
  row('Mieter:', booking.renter_name);
  row('Führerscheinnummer:', booking.drivers_license_number);
  row('Personalausweisnummer:', booking.id_card_number);
  row('Telefonnummer:', booking.phone);
  y -= 10;

  sectionTitle('Mietgegenstand & Zeitraum');
  row('Fahrzeug:', vehicle.name);
  row('Mietbeginn:', formatDateTime(booking.start_datetime));
  row('Mietende:', formatDateTime(booking.end_datetime));
  row('Mietpreis:', formatPrice(booking.price));
  if (booking.note) row('Notiz:', booking.note);
  y -= 10;

  sectionTitle('Vertragsbedingungen');
  paragraph(
    '1. Der Mieter verpflichtet sich, das Fahrzeug pfleglich zu behandeln und ausschließlich im Rahmen der ' +
      'Straßenverkehrsordnung zu nutzen. Renn- und Driftveranstaltungen sowie die Nutzung außerhalb öffentlicher ' +
      'Straßen sind ohne ausdrückliche schriftliche Zustimmung des Vermieters untersagt.'
  );
  paragraph(
    '2. Das Fahrzeug darf nur von dem im Vertrag genannten Mieter geführt werden, sofern nicht schriftlich ' +
      'weitere Fahrer vereinbart wurden. Der Mieter muss im Besitz einer gültigen Fahrerlaubnis der ' +
      'entsprechenden Klasse sein.'
  );
  paragraph(
    '3. Bei Rückgabe wird das Fahrzeug gemeinsam mit dem Vermieter auf Schäden, Kilometerstand und Tankfüllung ' +
      'geprüft. Etwaige Schäden, die während der Mietzeit entstanden sind, werden dem Mieter in Rechnung gestellt, ' +
      'soweit sie nicht durch die Versicherung gedeckt sind.'
  );
  paragraph(
    '4. Der vereinbarte Mietpreis ist vor oder bei Übergabe des Fahrzeugs vollständig zu begleichen, sofern ' +
      'nichts anderes vereinbart wurde. Eine Kaution kann bei Übergabe zusätzlich vereinbart werden.'
  );
  paragraph(
    '5. Der Mieter haftet im Rahmen der geltenden gesetzlichen Bestimmungen für Schäden am Fahrzeug sowie für ' +
      'Verstöße gegen die Straßenverkehrsordnung während der Mietzeit.'
  );
  paragraph(
    '6. Verspätete Rückgabe wird pro angefangener Stunde zusätzlich berechnet. Der Mieter informiert den ' +
      'Vermieter unverzüglich bei absehbaren Verzögerungen.'
  );

  if (y < 180) {
    page = pdfDoc.addPage([PAGE.width, PAGE.height]);
    y = drawHeader(page, font, boldFont, 'Mietvertrag (Fortsetzung)');
  }

  y -= 20;
  sectionTitle('Unterschriften');
  const sigY = y - 40;
  page.drawLine({ start: { x: margin, y: sigY }, end: { x: margin + 220, y: sigY }, thickness: 0.75, color: COLORS.hairline });
  page.drawText('Vermieter (Bartling Performance)', { x: margin, y: sigY - 14, size: 8.5, font, color: COLORS.lightGray });

  page.drawLine({
    start: { x: margin + contentWidth - 220, y: sigY },
    end: { x: margin + contentWidth, y: sigY },
    thickness: 0.75,
    color: COLORS.hairline,
  });
  page.drawText('Mieter', {
    x: margin + contentWidth - 220,
    y: sigY - 14,
    size: 8.5,
    font,
    color: COLORS.lightGray,
  });

  const pages = pdfDoc.getPages();
  pages.forEach((p, idx) => drawFooter(p, font, idx + 1, pages.length));

  return pdfDoc.save();
}
