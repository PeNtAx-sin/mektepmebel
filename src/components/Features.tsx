





export default function Features() {
  const features = [
    {
      title: "ГОСТ Стандарт",
      desc: "Полное соответствие требованиям",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 11 2s10 4.477 10 10Z" />
        </svg>
      ),
    },
    {
      title: "Металл 1.5 мм",
      desc: "Усиленный каркас мебели",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
    },
    {
      title: "Всегда в наличии",
      desc: "Отгрузка со склада в день заказа",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 py-6">
      {features.map((item, idx) => (
        // Карточка: Белый фон + Серая рамка
        <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-[#F3F4F6] shadow-sm">
          {/* 30% ЦВЕТА: Серая подложка #F3F4F6 */}
          <div className="p-3 bg-[#F3F4F6] rounded-full text-[#1D4ED8]">
            {item.icon}
          </div>
          <div>
            {/* 10% ЦВЕТА: Синий текст #3d4969ff */}
            <h3 className="font-bold text-sm uppercase tracking-wide text-[#3d4969ff]">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
