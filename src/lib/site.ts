export const site = {
  url: "https://mektepmebel.kz",
  name: "Mektep Mebel",
  tagline: "Школьная мебель в Казахстане",
  // TODO: заменить реальными контактами
  phone: "+7 (747) 17-19-253",
  phoneHref: "tel:+77471719253",
  email: "info@mektepmebel.kz",
  address: "г. Алматы, пр. Аль-Фараби 17/1",
  whatsapp: "77010000000",
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
