export const site = {
  url: "https://mektepmebel.kz",
  name: "Mektep Mebel",
  tagline: "Школьная мебель в Казахстане",
  // TODO: заменить реальными контактами
  phone: "+7 (747) 17-19-253",
  phoneHref: "tel:+77471719253",
  email: "pentaxsin@icloud.com",
  address: "г. Алматы, пр. Уссурийская 44",
  whatsapp: "77471719253",
  // Микроразметка LocalBusiness (адрес, телефон для карт и поиска) выводится,
  // только когда контакты выше проверены. TODO: проверить и поставить true.
  contactsVerified: false,
  city: "Алматы",
  streetAddress: "пр. Уссурийская 44",
  // TODO: часы работы, например ["Mo-Fr 09:00-18:00", "Sa 10:00-15:00"]
  openingHours: [] as string[],
  // TODO: ссылки на Instagram, 2ГИС, Google Maps — для sameAs в микроразметке
  sameAs: [] as string[],
  // Ключ IndexNow (Яндекс, Bing): публичный, отдаётся по адресу /<ключ>.txt
  indexNowKey: "92273c8e4029737b2b2f364ace5504fa",
};

export type MenuItem = { title: string; href: string; children?: MenuItem[] };

// Меню каталога строится из категорий Sanity: getCatalogMenu() в src/lib/data.ts

// TODO: вернуть в меню, когда появятся страницы:
// /dlya-shkol (Для школ и тендеры), /dostavka-i-oplata (Доставка и оплата),
// /o-kompanii (О компании), /blog (Блог), /kontakty (Контакты)
export const mainNav: MenuItem[] = [
  { title: "Главная", href: "/" },
  { title: "Каталог", href: "/catalog" },
];
