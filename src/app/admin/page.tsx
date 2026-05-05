"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "../../lib/supabase";

type SaleItem = { name: string; quantity: number };

type Sale = {
  id: number;
  company_name: string;
  amount: number;
  paid_amount: number;
  status: string;
  sale_date: string;
  items: SaleItem[];
};

export default function AdminDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Форма добавления
  const [companyName, setCompanyName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [status, setStatus] = useState("paid");
  const [saleDate, setSaleDate] = useState("");
  const [items, setItems] = useState<SaleItem[]>([{ name: "", quantity: 1 }]);

  // Управление графиками
  const [showDebtDetails, setShowDebtDetails] = useState(false);

  // === СОСТОЯНИЯ ДЛЯ ПОИСКА И ФИЛЬТРОВ ===
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [sortBy, setSortBy] = useState("date_desc"); 

  // Цвета для графиков
  const COLORS = ["#10B981", "#F43F5E"]; 
  const DEBT_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#60a5fa", "#c084fc"];

  const fetchSales = async () => {
    const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
    if (!error && data) setSales(data);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleAddItem = () => setItems([...items, { name: "", quantity: 1 }]);
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const totalAmount = Number(amount);
    let finalPaid = 0;
    
    if (status === "paid") finalPaid = totalAmount;
    if (status === "debt") finalPaid = 0;
    if (status === "partial") finalPaid = Number(paidAmount);

    const { error } = await supabase.from("sales").insert([
      {
        company_name: companyName,
        amount: totalAmount,
        paid_amount: finalPaid,
        status: status,
        sale_date: saleDate,
        items: items,
      },
    ]);

    if (!error) {
      setCompanyName(""); setAmount(""); setPaidAmount(""); setStatus("paid"); setSaleDate("");
      setItems([{ name: "", quantity: 1 }]);
      fetchSales();
    } else {
      console.error(error);
      alert("Ошибка базы данных: " + error.message);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Вы уверены, что хотите удалить эту запись?")) {
      await supabase.from("sales").delete().eq("id", id);
      fetchSales();
    }
  };

  const handleStatusChange = async (id: number, newStatus: string, totalAmount: number, currentPaid: number) => {
    let newPaid = currentPaid;

    if (newStatus === "paid") newPaid = totalAmount;
    if (newStatus === "debt") newPaid = 0;
    if (newStatus === "partial") {
      const userInput = prompt(`Общая сумма ${totalAmount} ₸. Сколько уже оплачено?`, currentPaid.toString());
      if (userInput === null) return; 
      newPaid = Number(userInput);
    }

    await supabase.from("sales").update({ status: newStatus, paid_amount: newPaid }).eq("id", id);
    fetchSales();
  };

  // === ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ ===
  let processedSales = [...sales];

  if (searchTerm) {
    processedSales = processedSales.filter(sale => 
      sale.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterStatus === "debtors") {
    processedSales = processedSales.filter(sale => sale.status === "debt" || sale.status === "partial");
  }

  processedSales.sort((a, b) => {
    if (sortBy === "date_desc") return new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime();
    if (sortBy === "date_asc") return new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime();
    if (sortBy === "amount_desc") return b.amount - a.amount;
    if (sortBy === "amount_asc") return a.amount - b.amount;
    return 0;
  });

  const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.paid_amount), 0);
  const totalDebt = sales.reduce((acc, sale) => acc + (Number(sale.amount) - Number(sale.paid_amount)), 0);

  const mainChartData = [
    { name: "Оплачено", value: totalRevenue },
    { name: "В долгах", value: totalDebt },
  ];

  const debtByCompany = sales
    .filter(sale => sale.status !== 'paid')
    .reduce((acc: any, sale) => {
      const debt = Number(sale.amount) - Number(sale.paid_amount);
      if (debt > 0) acc[sale.company_name] = (acc[sale.company_name] || 0) + debt;
      return acc;
    }, {});

  const debtChartData = Object.keys(debtByCompany).map((key) => ({
    name: key,
    value: debtByCompany[key],
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Продажи</h1>

        {/* --- ВЕРХНИЙ БЛОК: ФОРМА И ГРАФИКИ --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Левая часть: Максимально четкая форма добавления */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Новая реализация</h2>
            <form onSubmit={handleAddSale} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Организация / БИН</label>
                  <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} type="text" placeholder="ТОО / ИП / Школа" 
                    className="px-4 py-3 text-xl font-black text-gray-900 placeholder:text-gray-500 placeholder:font-semibold border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Дата</label>
                  <input required value={saleDate} onChange={(e) => setSaleDate(e.target.value)} type="date" 
                    className="px-4 py-3 text-xl font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 space-y-4 shadow-inner">
                <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Проданные позиции</label>
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <input required value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} type="text" placeholder="Название товара (например, Парта)" 
                      className="px-4 py-3 text-lg font-bold text-gray-900 placeholder:text-gray-500 placeholder:font-medium border-2 border-gray-400 rounded-xl flex-1 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
                    
                    <input required value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} type="number" min="1" placeholder="Шт." 
                      className="px-4 py-3 text-xl font-black text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 rounded-xl w-32 text-center focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
                    
                    {items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(index)} className="px-5 py-3 bg-red-100 text-red-700 font-black rounded-xl border-2 border-red-200 hover:bg-red-200 transition-colors text-xl">✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddItem} className="text-base text-blue-700 font-black hover:underline mt-2 inline-block">+ Добавить еще позицию</button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Общая сумма (₸)</label>
                  <input required value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" 
                    className="px-4 py-3 text-2xl font-black text-gray-900 placeholder:text-gray-400 border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">Статус оплаты</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} 
                    className="px-4 py-3 text-xl font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none bg-white cursor-pointer transition-all">
                    <option value="paid">✅ Оплачено полностью</option>
                    <option value="partial">⏳ Частичная оплата</option>
                    <option value="debt">❌ В долг (0 ₸)</option>
                  </select>
                </div>

                {status === "partial" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-amber-800 uppercase tracking-wide">Уже внесли (₸)</label>
                    <input required value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} type="number" placeholder="0" 
                      className="px-4 py-3 text-2xl font-black text-amber-900 placeholder:text-amber-600/50 border-2 border-amber-500 bg-amber-50 rounded-xl focus:border-amber-600 focus:ring-4 focus:ring-amber-200 outline-none transition-all" />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button disabled={isLoading} type="submit" className="px-10 py-4 text-xl bg-blue-600 text-white font-black rounded-xl border-b-4 border-blue-800 hover:bg-blue-500 hover:border-blue-700 active:border-b-0 active:translate-y-1 shadow-lg transition-all disabled:opacity-50">
                  {isLoading ? "Сохранение..." : "💾 ДОБАВИТЬ В РЕЕСТР"}
                </button>
              </div>
            </form>
          </div>

          {/* Правая часть: Графики */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col items-center justify-center">
            <h2 className="text-xl font-black text-gray-900 w-full text-left mb-2">
              {showDebtDetails ? "Кому мы отгрузили в долг?" : "Общая выручка vs Долги"}
            </h2>
            
            {showDebtDetails && (
               <button onClick={() => setShowDebtDetails(false)} className="text-sm text-blue-600 mb-4 w-full text-left font-bold hover:underline">
                 ← Вернуться к общему графику
               </button>
            )}

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {showDebtDetails ? (
                  <PieChart>
                    <Pie data={debtChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {debtChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={DEBT_COLORS[index % DEBT_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${Number(value || 0).toLocaleString("ru-RU")} ₸`} />                  </PieChart>
                ) : (
                  <PieChart>
                    <Pie data={mainChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onClick={(data) => { if(data.name === "В долгах") setShowDebtDetails(true); }} className="cursor-pointer">
                      {mainChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${Number(value || 0).toLocaleString("ru-RU")} ₸`} />
                    <Legend wrapperStyle={{ fontWeight: 'black', fontSize: '16px', marginTop: '10px', color: '#111827' }} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>

            {showDebtDetails && (
              <div className="w-full mt-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {debtChartData.map((d, i) => (
                  <div key={i} className="flex justify-between border-b border-gray-100 py-3">
                    <span className="truncate pr-4 text-base font-bold text-gray-700">{d.name}</span>
                    <span className="text-base font-black text-red-500 whitespace-nowrap">{d.value.toLocaleString("ru-RU")} ₸</span>
                  </div>
                ))}
              </div>
            )}
            {!showDebtDetails && <p className="text-sm font-bold text-gray-500 text-center mt-6 bg-gray-50 p-3 rounded-xl border-2 border-gray-100">Нажмите на красную зону "В долгах", чтобы увидеть список должников.</p>}
          </div>
        </div>

        {/* --- ПАНЕЛЬ УПРАВЛЕНИЯ ТАБЛИЦЕЙ --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3">
            <input 
              type="text" 
              placeholder="🔍 Поиск по организации..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 text-lg font-bold text-gray-900 placeholder:text-gray-500 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div className="w-full md:w-auto flex gap-4">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 text-lg font-black text-gray-800 border-2 border-gray-300 rounded-xl outline-none cursor-pointer focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
            >
              <option value="all">Все записи</option>
              <option value="debtors">⚠️ Только должники</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 text-lg font-black text-gray-800 border-2 border-gray-300 rounded-xl outline-none cursor-pointer focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
            >
              <option value="date_desc">Сначала новые (по дате)</option>
              <option value="date_asc">Сначала старые (по дате)</option>
              <option value="amount_desc">Сумма (по убыванию)</option>
              <option value="amount_asc">Сумма (по возрастанию)</option>
            </select>
          </div>
        </div>

        {/* --- НИЖНИЙ БЛОК: ТАБЛИЦА ПРОДАЖ --- */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-base">
                <th className="p-5 font-black uppercase tracking-wider">Дата</th>
                <th className="p-5 font-black uppercase tracking-wider">Организация</th>
                <th className="p-5 font-black uppercase tracking-wider">Позиции (Товары)</th>
                <th className="p-5 font-black uppercase tracking-wider">Финансы</th>
                <th className="p-5 font-black uppercase tracking-wider">Статус</th>
                <th className="p-5 font-black uppercase tracking-wider text-center">Удал.</th>
              </tr>
            </thead>
            <tbody>
              {processedSales.map((sale) => {
                const debt = Number(sale.amount) - Number(sale.paid_amount);
                return (
                  <tr key={sale.id} className={`border-b-2 border-gray-100 last:border-0 hover:bg-gray-50 transition-colors
                    ${sale.status === 'paid' ? 'bg-emerald-50/50' : ''}
                    ${sale.status === 'partial' ? 'bg-amber-50/50' : ''}
                    ${sale.status === 'debt' ? 'bg-rose-50/50' : ''}
                  `}>
                    <td className="p-5 text-lg font-black text-gray-800 whitespace-nowrap">
                      {new Date(sale.sale_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="p-5 text-xl font-black text-gray-900">{sale.company_name}</td>
                    <td className="p-5">
                      <ul className="space-y-1">
                        {sale.items.map((item, idx) => (
                          <li key={idx} className="text-lg font-bold text-gray-800">
                            • {item.name} <span className="text-gray-500 font-black ml-2">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <div className="text-xl font-black text-gray-900">Итого: {sale.amount.toLocaleString("ru-RU")} ₸</div>
                      {sale.status !== 'paid' && (
                        <div className="mt-2 bg-white/80 p-3 rounded-xl border-2 border-gray-200">
                          <div className="text-emerald-700 text-base font-black">Оплачено: {sale.paid_amount.toLocaleString("ru-RU")} ₸</div>
                          <div className="text-rose-600 text-lg font-black mt-1">Долг: {debt.toLocaleString("ru-RU")} ₸</div>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <select 
                        value={sale.status} 
                        onChange={(e) => handleStatusChange(sale.id, e.target.value, sale.amount, sale.paid_amount)}
                        className={`text-lg font-black p-3 rounded-xl border-2 outline-none cursor-pointer transition-all shadow-sm
                          ${sale.status === 'paid' ? 'bg-emerald-100 text-emerald-900 border-emerald-400 hover:bg-emerald-200' : ''}
                          ${sale.status === 'partial' ? 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200' : ''}
                          ${sale.status === 'debt' ? 'bg-rose-100 text-rose-900 border-rose-400 hover:bg-rose-200' : ''}
                        `}
                      >
                        <option value="paid">✅ Оплачено</option>
                        <option value="partial">⏳ Частично</option>
                        <option value="debt">❌ В долг</option>
                      </select>
                    </td>
                    <td className="p-5 text-center">
                      <button onClick={() => handleDelete(sale.id)} className="p-3 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-all border-2 border-transparent hover:border-red-700 shadow-sm" title="Удалить">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {processedSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-xl font-black text-gray-400">
                    По вашему запросу ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}