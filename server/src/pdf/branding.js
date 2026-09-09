import { rgb } from 'pdf-lib';

export const COLORS = {
  black: rgb(0.04, 0.04, 0.04),
  red: rgb(0.863, 0.118, 0.118),
  white: rgb(1, 1, 1),
  grayText: rgb(0.25, 0.25, 0.25),
  lightGray: rgb(0.55, 0.55, 0.55),
  hairline: rgb(0.82, 0.82, 0.82),
};

export const PAGE = {
  width: 595.28, // A4 pt
  height: 841.89,
  margin: 50,
};

export function drawHeader(page, font, boldFont, title) {
  const { width, height, margin } = PAGE;

  // Black brand bar
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width,
    height: 90,
    color: COLORS.black,
  });
  page.drawText('BARTLING', {
    x: margin,
    y: height - 45,
    size: 20,
    font: boldFont,
    color: COLORS.white,
  });
  const bartlingWidth = boldFont.widthOfTextAtSize('BARTLING ', 20);
  page.drawText('PERFORMANCE', {
    x: margin + bartlingWidth,
    y: height - 45,
    size: 20,
    font: boldFont,
    color: COLORS.red,
  });
  page.drawText(title, {
    x: margin,
    y: height - 68,
    size: 11,
    font,
    color: rgb(0.75, 0.75, 0.75),
  });

  return height - 120;
}

export function drawFooter(page, font, pageNumber, totalPages) {
  const { width, margin } = PAGE;
  page.drawLine({
    start: { x: margin, y: 45 },
    end: { x: width - margin, y: 45 },
    thickness: 0.75,
    color: COLORS.hairline,
  });
  page.drawText('Bartling Performance · Sportwagenvermietung', {
    x: margin,
    y: 30,
    size: 8,
    font,
    color: COLORS.lightGray,
  });
  page.drawText(`Seite ${pageNumber} / ${totalPages}`, {
    x: width - margin - 60,
    y: 30,
    size: 8,
    font,
    color: COLORS.lightGray,
  });
}

export function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrice(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}
