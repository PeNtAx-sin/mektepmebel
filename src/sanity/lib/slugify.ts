const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ә: "a", ғ: "g", қ: "k", ң: "n", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
};

/** Проверка slug для валидации в Studio: только латиница, цифры и дефисы */
export function checkSlug(slug: { current?: string } | undefined): true | string {
  const value = slug?.current ?? "";
  if (!value) return "Нажмите «Generate» или впишите адрес";
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
    ? true
    : "Только строчная латиница, цифры и дефисы, без пробелов — нажмите «Generate»";
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => MAP[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}