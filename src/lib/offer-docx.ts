import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { site } from "@/lib/site";

// Коммерческое предложение в Word: шапка с датой и компанией, таблица товаров с фото, итог

export type OfferLine = {
  title: string;
  image: string | null; // адрес фото в Sanity CDN
  price: number;
  quantity: number;
};

export type OfferInput = {
  date: string; // 2026-10-28
  company: string;
  vatIncluded: boolean;
  lines: OfferLine[];
};

const BLUE = "1E40AF";
const GREY = "64748B";
const FONT = "Arial";
const IMAGE_PX = 80; // размер фото в документе

const money = (n: number) => `${n.toLocaleString("ru-RU")} ₸`;

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

/** Фото товара квадратом на белом фоне, в JPEG — Word не понимает WebP и прозрачность */
async function loadImage(url: string | null): Promise<Buffer | null> {
  if (!url) return null;
  const sep = url.includes("?") ? "&" : "?";
  try {
    const res = await fetch(`${url}${sep}w=240&h=240&fit=fill&bg=ffffff&fm=jpg&q=85`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null; // без фото документ всё равно соберётся
  }
}

const text = (value: string, opts: { bold?: boolean; color?: string; size?: number } = {}) =>
  new TextRun({ text: value, font: FONT, bold: opts.bold, color: opts.color, size: opts.size ?? 20 });

const border = { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(
  children: (TextRun | ImageRun)[],
  width: number,
  opts: { header?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; span?: number } = {},
) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    columnSpan: opts.span,
    verticalAlign: VerticalAlign.CENTER,
    borders,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    shading: opts.header ? { type: ShadingType.CLEAR, color: "auto", fill: BLUE } : undefined,
    children: [new Paragraph({ alignment: opts.align ?? AlignmentType.LEFT, children })],
  });
}

// ширины столбцов в twip: A4 без полей ≈ 10200
const COLS = { n: 500, title: 3600, image: 1700, price: 1500, qty: 1000, sum: 1900 };

export async function buildOfferDocx(input: OfferInput): Promise<Buffer> {
  const images = await Promise.all(input.lines.map((l) => loadImage(l.image)));
  const total = input.lines.reduce((s, l) => s + l.price * l.quantity, 0);

  const header = new TableRow({
    tableHeader: true,
    children: [
      cell([text("№", { bold: true, color: "FFFFFF" })], COLS.n, { header: true, align: AlignmentType.CENTER }),
      cell([text("Наименование", { bold: true, color: "FFFFFF" })], COLS.title, { header: true }),
      cell([text("Изображение", { bold: true, color: "FFFFFF" })], COLS.image, { header: true, align: AlignmentType.CENTER }),
      cell([text("Цена", { bold: true, color: "FFFFFF" })], COLS.price, { header: true, align: AlignmentType.RIGHT }),
      cell([text("Кол-во", { bold: true, color: "FFFFFF" })], COLS.qty, { header: true, align: AlignmentType.CENTER }),
      cell([text("Сумма", { bold: true, color: "FFFFFF" })], COLS.sum, { header: true, align: AlignmentType.RIGHT }),
    ],
  });

  const rows = input.lines.map(
    (l, i) =>
      new TableRow({
        cantSplit: true,
        children: [
          cell([text(String(i + 1))], COLS.n, { align: AlignmentType.CENTER }),
          cell([text(l.title, { bold: true })], COLS.title),
          cell(
            images[i]
              ? [new ImageRun({ type: "jpg", data: images[i]!, transformation: { width: IMAGE_PX, height: IMAGE_PX }, altText: { name: l.title, description: l.title, title: l.title } })]
              : [text("—", { color: GREY })],
            COLS.image,
            { align: AlignmentType.CENTER },
          ),
          cell([text(money(l.price))], COLS.price, { align: AlignmentType.RIGHT }),
          cell([text(`${l.quantity} шт.`)], COLS.qty, { align: AlignmentType.CENTER }),
          cell([text(money(l.price * l.quantity), { bold: true })], COLS.sum, { align: AlignmentType.RIGHT }),
        ],
      }),
  );

  const totalRow = new TableRow({
    children: [
      cell([text("Итого", { bold: true, size: 22 })], COLS.n + COLS.title + COLS.image + COLS.price + COLS.qty, {
        span: 5,
        align: AlignmentType.RIGHT,
      }),
      cell([text(money(total), { bold: true, size: 22, color: BLUE })], COLS.sum, { align: AlignmentType.RIGHT }),
    ],
  });

  const doc = new Document({
    creator: site.name,
    title: `Коммерческое предложение для ${input.company}`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 850, bottom: 850, left: 850, right: 850 } } },
        children: [
          // реквизиты поставщика
          new Paragraph({ children: [text(site.name.toUpperCase(), { bold: true, size: 28, color: BLUE })] }),
          new Paragraph({ children: [text(site.tagline, { color: GREY })] }),
          new Paragraph({
            spacing: { after: 400 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } },
            children: [text(`${site.phone}  ·  ${site.email}  ·  ${site.url.replace("https://", "")}`, { color: GREY, size: 18 })],
          }),

          // оглавление: дата и компания
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [text("КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ", { bold: true, size: 32 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [text(`от ${formatDate(input.date)}`, { color: GREY, size: 22 })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [text("Для: ", { color: GREY, size: 22 }), text(input.company, { bold: true, size: 22 })],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [text("Предлагаем рассмотреть поставку следующих позиций:", { size: 22 })],
          }),

          new Table({
            width: { size: Object.values(COLS).reduce((a, b) => a + b, 0), type: WidthType.DXA },
            columnWidths: Object.values(COLS),
            rows: [header, ...rows, totalRow],
          }),

          new Paragraph({
            spacing: { before: 160 },
            children: [text(`Цены указаны в тенге, ${input.vatIncluded ? "с учётом НДС" : "без НДС"}.`, { color: GREY, size: 18 })],
          }),
          new Paragraph({
            spacing: { before: 480 },
            children: [text("С уважением,", { size: 22 })],
          }),
          new Paragraph({ children: [text(site.name, { bold: true, size: 22 })] }),
          new Paragraph({ children: [text(`${site.phone}, ${site.email}`, { color: GREY, size: 20 })] }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
