"use client";

import { useState } from "react";
import { useCart, type AddInput } from "./CartProvider";

export default function AddToCartButton({
  item,
  variant = "full",
}: {
  item: AddInput;
  variant?: "full" | "icon";
}) {
  const { add } = useCart();
  const [done, setDone] = useState(false);

  const handleClick = () => {
    add(item);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title="Добавить в смету"
        aria-label="Добавить в смету"
        className={`p-2.5 text-white rounded-xl text-xs shadow transition ${
          done ? "bg-brand-500" : "bg-school-blue hover:bg-blue-800"
        }`}
      >
        <i className={`fa-solid ${done ? "fa-check" : "fa-cart-plus"}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3.5 rounded-xl shadow transition text-sm flex items-center justify-center gap-2"
    >
      <i className={`fa-solid ${done ? "fa-check" : "fa-cart-plus"}`} />
      {done ? "Добавлено" : "Добавить в смету"}
    </button>
  );
}