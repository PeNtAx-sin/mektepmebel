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
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-24 right-4 md:top-28 md:right-8 bg-[#047EB2] text-white p-4 rounded-full shadow-[0_8px_30px_rgb(4,126,178,0.4)] hover:bg-[#1D4ED8] hover:scale-105 transition-all z-[60] group"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M9 21V9" />
        </svg>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          
          <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden font-sans">
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-full transition-colors z-10"
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 md:p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Расчет комплектующих</h1>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Количество парт</label>
                        <input 
                            type="number" 
                            min="1" 
                            placeholder="Например: 10" 
                            value={deskCount}
                            onChange={(e) => setDeskCount(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#047EB2] focus:border-[#047EB2] outline-none transition-all"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Тип парты</label>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setDeskType('oneSeater')}
                                className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${
                                    deskType === 'oneSeater' 
                                    ? 'border-[#047EB2] bg-[#E0F2FE] text-[#047EB2]' 
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                Одноместная
                            </button>
                            <button 
                                onClick={() => setDeskType('twoSeater')}
                                className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold transition-all border-2 ${
                                    deskType === 'twoSeater' 
                                    ? 'border-[#047EB2] bg-[#E0F2FE] text-[#047EB2]' 
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                Двухместная
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleCalculate}
                    className="w-full md:w-auto px-10 py-4 bg-[#047EB2] hover:bg-[#0369A1] text-white text-sm font-black tracking-wider uppercase rounded-xl shadow-[0_4px_14px_0_rgba(4,126,178,0.39)] hover:shadow-[0_6px_20px_rgba(4,126,178,0.23)] hover:-translate-y-0.5 transition-all"
                >
                    РАССЧИТАТЬ СМЕТУ
                </button>

                {hasError && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm border border-red-100 rounded-lg font-medium">
                        Пожалуйста, введите корректное количество парт.
                    </div>
                )}

                {results && !hasError && (
                    <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in duration-300">
                        
                        {/* --- ВАЖНО: ВЫДЕЛЕННЫЙ БЛОК ДЛЯ СКАЧИВАНИЯ --- */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 w-full text-center sm:text-left">
                                {results.count} шт. ({results.typeLabel})
                            </h2>

                            <button 
                                onClick={handleDownload}
                                // Изменили отступы: px-4 (меньше по горизонтали) и py-5 (больше по вертикали). Убрали w-full.
                                className="flex items-center justify-center gap-2 px-4 py-5 bg-white border-2 border-[#10B981] hover:bg-[#F0FDF4] text-black text-sm font-black uppercase tracking-widest rounded-xl shadow-[0_4px_14px_0_rgba(16,185,129,0.15)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Скачать Excel
                            </button>
                        </div>
                        {/* --- КОНЕЦ БЛОКА СКАЧИВАНИЯ --- */}

                        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                                        <th className="py-3 px-4 font-semibold whitespace-nowrap">Деталь</th>
                                        <th className="py-3 px-4 font-semibold text-center w-24">Ед. изм.</th>
                                        <th className="py-3 px-4 font-semibold text-center w-28">Всего</th>
                                        <th className="py-3 px-4 font-semibold text-center w-28">Коробок</th>
                                        <th className="py-3 px-4 font-semibold text-right w-36">Остаток</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {results.data.map((row: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3 px-4 text-gray-800 font-medium">{row.name}</td>
                                            <td className="py-3 px-4 text-center text-gray-400">{row.unit}</td>
                                            <td className="py-3 px-4 text-center font-bold text-blue-600">{row.total}</td>
                                            <td className="py-3 px-4 text-center text-gray-700 font-medium">{row.boxes}</td>
                                            <td className="py-3 px-4 text-right">
                                                {row.remainder > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                                                        +{row.remainder} {row.unit}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 font-bold">-</span>
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