import JsonLd from "@/components/JsonLd";
import type { Faq } from "@/lib/data";

/** Частые вопросы с микроразметкой FAQPage */
export default function FaqSection({ faq, title = "Частые вопросы" }: { faq: Faq[]; title?: string }) {
  const items = faq.filter((f) => f.question && f.answer);
  if (items.length === 0) return null;

  return (
    <section className="mt-10 space-y-3">
      <h2 className="text-2xl font-black text-slate-900">{title}</h2>
      {items.map((f, i) => (
        <details key={i} className="group bg-white border border-slate-200 rounded-2xl p-5">
          <summary className="cursor-pointer font-semibold text-slate-900 text-sm list-none flex items-center justify-between gap-4">
            {f.question}
            <i className="fa-solid fa-chevron-down text-xs text-slate-400 transition group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.answer}</p>
        </details>
      ))}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }}
      />
    </section>
  );
}
