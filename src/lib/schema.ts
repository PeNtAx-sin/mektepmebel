import type { Product } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { site } from "@/lib/site";

// Микроразметка schema.org, общая для нескольких страниц

export const ORGANIZATION_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;

/** Список товаров на странице категории / подборки */
export function itemListSchema(name: string, path: string, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/catalog/${p.categorySlug}/${p.slug}`),
      name: p.title,
    })),
  };
}

/** Фото как ImageObject: подпись и автор помогают поиску по картинкам */
export function imageObject(url: string, caption: string) {
  return {
    "@type": "ImageObject",
    url,
    contentUrl: url,
    caption,
    creditText: site.name,
    copyrightNotice: site.name,
  };
}

/**
 * Организация и сайт — на каждой странице. Поиск по сайту (SearchAction)
 * даёт Google строку поиска в выдаче. LocalBusiness (адрес и телефон для карт)
 * выводится только после проверки контактов: site.contactsVerified.
 */
export function siteSchemas() {
  const logo = `${site.url}/logo.png`;
  const organization = {
    "@type": site.contactsVerified ? ["Organization", "FurnitureStore"] : "Organization",
    "@id": ORGANIZATION_ID,
    name: site.name,
    url: site.url,
    logo,
    image: logo,
    description: "Школьная мебель, школьные и пластиковые стулья с доставкой по Казахстану.",
    areaServed: { "@type": "Country", name: "Казахстан" },
    ...(site.sameAs.length > 0 && { sameAs: site.sameAs }),
    ...(site.contactsVerified && {
      telephone: site.phoneHref.replace("tel:", ""),
      email: site.email,
      priceRange: "₸₸",
      currenciesAccepted: "KZT",
      address: {
        "@type": "PostalAddress",
        streetAddress: site.streetAddress,
        addressLocality: site.city,
        addressCountry: "KZ",
      },
      ...(site.openingHours.length > 0 && { openingHours: site.openingHours }),
    }),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: site.url,
        name: site.name,
        inLanguage: "ru",
        publisher: { "@id": ORGANIZATION_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
