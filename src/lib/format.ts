export function plural(n: number, forms: [string, string, string]): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
  return forms[2];
}

export const formatPrice = (n: number) => `${n.toLocaleString("ru-RU")} ₸`;

/** Подпись к цене: «с НДС» или «без НДС» — смотря какое поле заполнено в Sanity */
export const vatLabel = (vatIncluded: boolean) => (vatIncluded ? "с НДС" : "без НДС");

/** Делит текст из Sanity на абзацы по пустой строке */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}
/** Дата для статей: «12 марта 2026 г.» */
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
