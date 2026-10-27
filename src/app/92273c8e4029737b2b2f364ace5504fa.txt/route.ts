import { site } from "@/lib/site";

// Файл-подтверждение IndexNow: поисковик проверяет, что ключ принадлежит сайту
export function GET() {
  return new Response(site.indexNowKey, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

export const dynamic = "force-static";
