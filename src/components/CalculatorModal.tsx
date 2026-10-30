"use client";

import { useState } from "react";

// 1. БАЗА ДАННЫХ
const COMPONENT_DATA = {
  twoSeater: [
    { name: 'Ноги парта', perSet: 1, perBox: 6, unit: 'пар' },
    { name: 'C образная труба + F Образная труба', perSet: 1, perBox: 6, unit: 'пар' },
    { name: 'Перемычка парта + Сетка', perSet: 1, perBox: 6, unit: 'пар' },
    { name: 'Ноги стул', perSet: 2, perBox: 6, unit: 'пар' },
    { name: 'U Образная труба для стула', perSet: 2, perBox: 12, unit: 'пар' },
    { name: 'Стойка стула «', perSet: 2, perBox: 48, unit: 'пар' }, 
    { name: 'Спинка', perSet: 2, perBox: 12, unit: 'шт' },
    { name: 'Сидушка', perSet: 2, perBox: 12, unit: 'шт' },
    { name: 'Перемычка для стула', perSet: 2, perBox: 0, unit: 'шт' },
    { name: 'Крючок', perSet: 2, perBox: 0, unit: 'шт' },
    { name: 'Втулка', perSet: 6, perBox: 0, unit: 'шт' },
    { name: 'Заглушка', perSet: 6, perBox: 0, unit: 'шт' },
    { name: 'Перфорация', perSet: 1, perBox: 0, unit: 'шт' },
    { name: 'Столешница', perSet: 1, perBox: 4, unit: 'шт' },
    { name: 'Шуруп регулировка', perSet: 12, perBox: 0, unit: 'шт' },
    { name: 'Шуруп перемычка', perSet: 12, perBox: 0, unit: 'шт' },
    { name: 'Шуруп тонкий + гайка', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Шуруп Толстый + гайка', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Шуруп втулка + болт на U', perSet: 8, perBox: 0, unit: 'шт' },
    { name: 'Саморез перфорац', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Саморез спинка', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Шуруп сидушка', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Шуруп столешница', perSet: 8, perBox: 0, unit: 'шт' }
  ],
  oneSeater: [
    { name: 'Ноги парта', perSet: 1, perBox: 6, unit: 'пар' },
    { name: 'F образная труба', perSet: 1, perBox: 6, unit: 'пар' },
    { name: 'С образная труба + Стойка стула «', perSet: 1, perBox: 0, unit: 'пар' }, 
    { name: 'Сетка и перемычка', perSet: 1, perBox: 6, unit: 'пар' },
    { name: 'Ноги стул', perSet: 1, perBox: 6, unit: 'пар' },
    { name: 'U Образная труба для стула', perSet: 1, perBox: 12, unit: 'пар' },
    { name: 'Спинка', perSet: 1, perBox: 12, unit: 'шт' },
    { name: 'Сидушка', perSet: 1, perBox: 12, unit: 'шт' },
    { name: 'Перемычка стула', perSet: 1, perBox: 0, unit: 'шт' },
    { name: 'Крючок', perSet: 1, perBox: 0, unit: 'шт' },
    { name: 'Втулка', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Заглушка', perSet: 6, perBox: 0, unit: 'шт' },
    { name: 'Перфорация', perSet: 1, perBox: 0, unit: 'шт' },
    { name: 'Столешница', perSet: 1, perBox: 5, unit: 'шт' },
    { name: 'Шуруп регулировка', perSet: 8, perBox: 0, unit: 'шт' },
    { name: 'Шуруп перемычка', perSet: 8, perBox: 0, unit: 'шт' },
    { name: 'Шуруп тонкий + гайка', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Шуруп Толстый + гайка', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Шуруп втулка + болт на U', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Саморез перфорац', perSet: 4, perBox: 0, unit: 'шт' },
    { name: 'Саморез спинка', perSet: 2, perBox: 0, unit: 'шт' },
    { name: 'Шуруп сидушка', perSet: 2, perBox: 0, unit: 'шт' },
    { name: 'Шуруп столешница', perSet: 8, perBox: 0, unit: 'шт' }
  ]
};

export default function CalculatorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [deskCount, setDeskCount] = useState("");
  const [deskType, setDeskType] = useState<"oneSeater" | "twoSeater">("twoSeater");
  const [hasError, setHasError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any>(null);

  const handleCalculate = () => {
    const count = parseInt(deskCount, 10);
    if (isNaN(count) || count <= 0) {
      setHasError(true);
      setResults(null);
      return;
    }
    setHasError(false);

    const partsArray = COMPONENT_DATA[deskType];
    const calcResults = partsArray.map((item) => {
      const total = item.perSet * count;
      let boxes = 0;
      let remainder = total;

      if (item.perBox > 0) {
        boxes = Math.floor(total / item.perBox);
        remainder = total % item.perBox;
      }

      return {
        name: item.name,
        unit: item.unit,
        total: total,
        boxes: boxes > 0 ? boxes : '-',
        remainder: remainder
      };
    });

    setResults({
      count,
      typeLabel: deskType === 'twoSeater' ? 'Двухместные парты' : 'Одноместные парты',
      data: calcResults
    });
  };

  const handleDownload = () => {
    if (!results) return;

    let tableStr = `<html xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8"></head>
    <body>
        <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif;">
            <tr>
                <th style="width: 450px; text-align: left; background-color: #f3f4f6; padding: 10px;">Наименование детали</th>
                <th style="width: 100px; text-align: center; background-color: #f3f4f6; padding: 10px;">Ед. изм.</th>
                <th style="width: 120px; text-align: center; background-color: #f3f4f6; padding: 10px;">Всего</th>
                <th style="width: 120px; text-align: center; background-color: #f3f4f6; padding: 10px;">Коробок</th>
                <th style="width: 150px; text-align: center; background-color: #f3f4f6; padding: 10px;">Остаток (доложить)</th>
            </tr>`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    results.data.forEach((row: any) => {
        tableStr += `<tr>
            <td style="padding: 5px; text-align: left;">${row.name}</td>
            <td style="padding: 5px; text-align: center;">${row.unit}</td>
            <td style="padding: 5px; text-align: center; font-weight: bold; color: #2563eb;">${row.total}</td>
            <td style="padding: 5px; text-align: center;">${row.boxes}</td>
            <td style="padding: 5px; text-align: center;">${row.remainder > 0 ? '+ ' + row.remainder + ' ' + row.unit : '-'}</td>
        </tr>`;
    });

    tableStr += `</table></body></html>`;

    const blob = new Blob([tableStr], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `Smeta_${results.count}_${deskType}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    return (
    <>
      {/* Плавающая кнопка */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Открыть калькулятор комплектующих"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] group flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white p-1.5 md:p-2 md:pr-5 rounded-full shadow-2xl border border-slate-700 transition"
      >
        <span className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-brand-500 group-hover:bg-brand-600 flex items-center justify-center text-xl transition">
          <i className="fa-solid fa-calculator" />
        </span>
        <span className="hidden md:block text-left leading-tight">
          <span className="block text-sm font-bold">Калькулятор</span>
          <span className="block text-[11px] text-slate-400">
            комплектующих для парт
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="calc-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Шапка окна */}
            <div className="relative bg-gradient-to-br from-slate-900 via-school-blue to-slate-900 text-white px-6 sm:px-8 py-6 shrink-0">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Закрыть"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10"
              >
                <i className="fa-solid fa-xmark" />
              </button>
              <div className="relative flex items-center gap-4 pr-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-brand-400 text-xl shrink-0">
                  <i className="fa-solid fa-calculator" />
                </div>
                <div>
                  <h2 id="calc-title" className="text-xl sm:text-2xl font-black">
                    Расчёт комплектующих
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    Сколько деталей и коробок потребуется для сборки парт
                  </p>
                </div>
              </div>
            </div>

            {/* Содержимое */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="calc-count"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
                  >
                    Количество парт
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-hashtag absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="calc-count"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      placeholder="Например: 10"
                      value={deskCount}
                      onChange={(e) => setDeskCount(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCalculate();
                      }}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-school-blue focus:ring-2 focus:ring-school-blue/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Тип парты
                  </span>
                  <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                    {(
                      [
                        { value: "oneSeater", label: "Одноместная", icon: "fa-user" },
                        { value: "twoSeater", label: "Двухместная", icon: "fa-user-group" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDeskType(opt.value)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm font-semibold transition ${
                          deskType === opt.value
                            ? "bg-white text-school-blue shadow"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <i className={`fa-solid ${opt.icon} text-xs`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                className="w-full md:w-auto px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-calculator" /> Рассчитать смету
              </button>

              {hasError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-sm border border-red-100 rounded-xl font-medium">
                  <i className="fa-solid fa-circle-exclamation" />
                  Пожалуйста, введите корректное количество парт.
                </div>
              )}

              {results && !hasError && (
                <div className="pt-6 border-t border-slate-100 space-y-5">
                  {/* Итоги */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Тип
                      </span>
                      <span className="block text-sm font-bold text-slate-900 mt-1">
                        {results.typeLabel}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Количество
                      </span>
                      <span className="block text-2xl font-black text-school-blue mt-0.5">
                        {results.count} шт.
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Позиций деталей
                      </span>
                      <span className="block text-2xl font-black text-slate-900 mt-0.5">
                        {results.data.length}
                      </span>
                    </div>
                  </div>

                  {/* Скачать */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-slate-900">Результат расчёта</h3>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-brand-500 hover:bg-brand-50 text-brand-700 text-sm font-bold rounded-xl transition"
                    >
                      <i className="fa-solid fa-file-excel" /> Скачать Excel
                    </button>
                  </div>

                  {/* Таблица */}
                  <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-300">
                          <th className="py-3 px-4 font-semibold">Деталь</th>
                          <th className="py-3 px-4 font-semibold text-center w-24">Ед. изм.</th>
                          <th className="py-3 px-4 font-semibold text-center w-28">Всего</th>
                          <th className="py-3 px-4 font-semibold text-center w-28">Коробок</th>
                          <th className="py-3 px-4 font-semibold text-right w-36">Остаток</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {results.data.map((row: any, idx: number) => (
                          <tr
                            key={idx}
                            className="odd:bg-white even:bg-slate-50/70 hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="py-3 px-4 text-slate-800 font-medium">{row.name}</td>
                            <td className="py-3 px-4 text-center text-slate-400">{row.unit}</td>
                            <td className="py-3 px-4 text-center font-black text-school-blue">
                              {row.total}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-700 font-semibold">
                              {row.boxes}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {row.remainder > 0 ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800">
                                  +{row.remainder} {row.unit}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-bold">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}