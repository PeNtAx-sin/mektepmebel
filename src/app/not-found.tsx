import type { Metadata } from "next";
import SiteLayout from "./(site)/layout";
import NotFoundContent from "./(site)/not-found";

// Несуществующие адреса: та же страница 404, что внутри сайта, с шапкой и подвалом
export const metadata: Metadata = {
  title: "Страница не найдена",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}
