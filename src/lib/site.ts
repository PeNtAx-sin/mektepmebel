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

export const catalogMenu: MenuItem[] = [
  {
    title: "Школьные парты",
    href: "/catalog/party",
    children: [
      { title: "Парта одноместная", href: "/catalog/odnomestnye-party" },
      { title: "Парта двухместная", href: "/catalog/dvuhmestnye-party" },
      { title: "Парта регулируемая по высоте", href: "/catalog/reguliruemye-party" },
    ],
  },
  { title: "Школьные стулья", href: "/catalog/stulya" },
  { title: "Комплекты (парта + стул)", href: "/catalog/komplekty" },
  { title: "Мебель для кабинетов", href: "/catalog/kabinety" },
  { title: "Мебель для детских садов", href: "/catalog/detskie-sady" },
];

export const mainNav: MenuItem[] = [
  { title: "Главная", href: "/" },
  { title: "Для школ и тендеры", href: "/dlya-shkol" },
  { title: "Доставка и оплата", href: "/dostavka-i-oplata" },
  { title: "О компании", href: "/o-kompanii" },
  { title: "Блог", href: "/blog" },
  { title: "Контакты", href: "/kontakty" },
];

// Пункты верхнего меню (подвал использует полный mainNav)
export const headerNav: MenuItem[] = [
  { title: "Для школ и тендеры", href: "/dlya-shkol" },
  { title: "Блог", href: "/blog" },
  { title: "Контакты", href: "/kontakty" },
];