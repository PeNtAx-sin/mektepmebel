import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { MouseEvent } from "react";
import { set, useClient, useFormValue, type ObjectInputProps } from "sanity";

type Position = { x?: number; y?: number };
type Pin = { _key: string; label?: string; position?: Position };

const dot = (x: number, y: number, color: string, size: number) =>
  ({
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    width: size,
    height: size,
    marginLeft: -size / 2,
    marginTop: -size / 2,
    borderRadius: "50%",
    background: color,
    border: "2px solid #fff",
    boxShadow: "0 1px 4px rgba(0,0,0,.4)",
    pointerEvents: "none",
  }) as const;

/**
 * Ввод места метки: клик по 3D-модели ставит x/y в процентах.
 * Поле лежит по пути <объект>.pins[_key].position; картинка — <объект>.image.
 */
export default function PinPositionInput(props: ObjectInputProps) {
  const value = (props.value ?? {}) as Position;
  const base = props.path.slice(0, -3); // путь к объекту с полями image и pins
  const image = useFormValue([...base, "image"]) as (SanityImageSource & { asset?: unknown }) | undefined;
  const pins = (useFormValue([...base, "pins"]) as Pin[] | undefined) ?? [];
  const client = useClient({ apiVersion: "2026-02-12" });

  const segment = props.path[props.path.length - 2];
  const ownKey = typeof segment === "object" && segment && "_key" in segment ? segment._key : null;

  if (!image?.asset) {
    return (
      <div style={{ padding: 12, border: "1px dashed #999", borderRadius: 6, fontSize: 14 }}>
        Сначала загрузите «3D-модель кабинета» выше — потом здесь можно будет кликнуть по ней.
      </div>
    );
  }

  const src = createImageUrlBuilder(client).image(image).width(900).auto("format").url();

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const round = (n: number) => Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
    props.onChange(
      set({
        x: round(((e.clientX - rect.left) / rect.width) * 100),
        y: round(((e.clientY - rect.top) / rect.height) * 100),
      }),
    );
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 13, opacity: 0.75 }}>
        Кликните по модели: красная точка — эта метка, серые — остальные.
      </div>
      <div
        onClick={handleClick}
        style={{ position: "relative", cursor: "crosshair", borderRadius: 6, overflow: "hidden", background: "#1e3a8a" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- это Studio, не сайт */}
        <img src={src} alt="" style={{ display: "block", width: "100%", height: "auto" }} draggable={false} />
        {pins
          .filter((p) => p._key !== ownKey && p.position?.x != null && p.position?.y != null)
          .map((p) => (
            <span key={p._key} title={p.label} style={dot(p.position!.x!, p.position!.y!, "#94a3b8", 12)} />
          ))}
        {value.x != null && value.y != null && <span style={dot(value.x, value.y, "#ef4444", 18)} />}
      </div>
      {props.renderDefault(props)}
    </div>
  );
}
