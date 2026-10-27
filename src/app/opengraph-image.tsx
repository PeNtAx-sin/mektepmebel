import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Картинка для соцсетей и мессенджеров (WhatsApp, Telegram, Facebook) по умолчанию.
// Страницы товаров подставляют вместо неё фото товара.
export const alt = "Mektep Mebel — школьная мебель и пластиковые стулья в Казахстане";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (name: string) => readFile(join(process.cwd(), "src/assets/fonts", name));

export default async function OpengraphImage() {
  const [latin400, latin800, cyr400, cyr800] = await Promise.all([
    font("inter-latin-400-normal.woff"),
    font("inter-latin-800-normal.woff"),
    font("inter-cyrillic-400-normal.woff"),
    font("inter-cyrillic-800-normal.woff"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          fontFamily: "InterCyr, Inter",
          background: "linear-gradient(135deg, #0f172a 0%, #1e40af 55%, #0f172a 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 1 }}>{site.name.toUpperCase()}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>Школьная мебель</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, color: "#34d399" }}>
            и пластиковые стулья
          </div>
          <div style={{ fontSize: 30, color: "#cbd5e1" }}>
            Парты, стулья, мебель для кабинетов · доставка по Казахстану
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#94a3b8" }}>mektepmebel.kz</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: latin400, weight: 400 },
        { name: "InterCyr", data: cyr400, weight: 400 },
        { name: "Inter", data: latin800, weight: 800 },
        { name: "InterCyr", data: cyr800, weight: 800 },
      ],
    },
  );
}
