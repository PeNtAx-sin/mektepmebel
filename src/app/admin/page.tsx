"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  const [isMounted, setIsMounted] = useState(false);

  // Форма
  const [companyName, setCompanyName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [status, setStatus] = useState("paid");
  const [saleDate, setSaleDate] = useState("");
  const [items, setItems] = useState<SaleItem[]>([{ name: "", quantity: 1 }]);

  // Графики и фильтры
  const [showDebtDetails, setShowDebtDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [sortBy, setSortBy] = useState("date_desc"); 

  const COLORS = ["#10B981", "#F43F5E"]; 
  const DEBT_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#60a5fa", "#c084fc"];

  const fetchSales = async () => {
    const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
    if (!error && data) setSales(data);
  };

  useEffect(() => {
    setIsMounted(true);
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
      alert("Ошибка: " + error.message);
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

  let processedSales = [...sales];
  if (searchTerm) {
    processedSales = processedSales.filter(sale => sale.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
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
  
  const hasData = totalRevenue > 0 || totalDebt > 0;

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

  const debtChartData = Object.keys(debtByCompany).map((key) => ({ name: key, value: debtByCompany[key] }));

  const customTooltipFormatter = (value: any, name: any) => {
    return [`${Number(value || 0).toLocaleString("ru-RU")} ₸`, name];
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Дашборд</h1>
          <a href="/" className="px-5 py-3 bg-slate-200 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-300">
            На сайт →
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6">Новая реализация</h2>
            <form onSubmit={handleAddSale} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Организация / БИН</label>
                  <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} type="text" placeholder="ТОО / ИП / Школа" 
                    className="w-full px-5 py-4 text-xl md:text-2xl font-black text-gray-900 placeholder:text-gray-500 placeholder:font-bold border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Дата отгрузки</label>
                  <input required value={saleDate} onChange={(e) => setSaleDate(e.target.value)} type="date" 
                    className="w-full px-5 py-4 text-xl md:text-2xl font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
                </div>
              </div>

              <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
                <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Проданные позиции</label>
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3">
                    <input required value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} type="text" placeholder="Название (например, Парта)" 
                      className="w-full px-5 py-4 text-lg md:text-xl font-black text-gray-900 placeholder:text-gray-500 placeholder:font-bold border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 outline-none bg-white" />
                    
                    <div className="flex gap-3">
                      <input required value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} type="number" min="1" placeholder="Шт." 
                        className="w-full md:w-32 px-5 py-4 text-xl font-black text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 rounded-xl text-center focus:border-blue-600 focus:ring-4 outline-none bg-white" />
                      
                      {items.length > 1 && (
                        <button type="button" onClick={() => handleRemoveItem(index)} className="px-5 py-4 bg-red-100 text-red-700 font-black rounded-xl border-2 border-red-200 hover:bg-red-200 shrink-0">✕</button>
                      )}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={handleAddItem} className="text-sm md:text-base text-blue-700 font-black hover:underline mt-2">+ Добавить еще позицию</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Сумма (₸)</label>
                  <input required value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" 
                    className="w-full px-5 py-4 text-2xl md:text-3xl font-black text-gray-900 placeholder:text-gray-400 border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white" />
                </div>
                
                <div className="flex flex-col gap-2 md:col-span-1">
                  <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Статус</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} 
                    className="w-full px-5 py-4 text-xl font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white cursor-pointer">
                    <option value="paid">✅ Оплачено</option>
                    <option value="partial">⏳ Частично</option>
                    <option value="debt">❌ В долг</option>
                  </select>
                </div>

                {status === "partial" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs md:text-sm font-bold text-amber-800 uppercase tracking-wide">Внесли (₸)</label>
                    <input required value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} type="number" placeholder="0" 
                      className="w-full px-5 py-4 text-2xl md:text-3xl font-black text-amber-950 placeholder:text-amber-700/60 border-2 border-amber-500 bg-amber-50 rounded-xl focus:border-amber-600 outline-none" />
                  </div>
                )}
              </div>

              <button disabled={isLoading} type="submit" className="w-full md:w-auto mt-4 px-10 py-5 text-xl font-black bg-blue-600 text-white rounded-xl border-b-4 border-blue-800 hover:bg-blue-500 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 uppercase tracking-wider">
                {isLoading ? "Сохранение..." : "💾 Сохранить в базу"}
              </button>
            </form>
          </div>

          <div className="bg-white p-5 md:p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col items-start justify-start">
            <h2 className="text-lg md:text-xl font-black text-gray-900 w-full text-left mb-2">
              {showDebtDetails ? "Должники" : "Выручка vs Долги"}
            </h2>
            
            {showDebtDetails && hasData && (
               <button onClick={() => setShowDebtDetails(false)} className="text-sm text-blue-600 mb-2 w-full text-left font-bold hover:underline">
                 ← Назад к графику
               </button>
            )}

            <div className="h-64 w-full mt-4">
              {!isMounted ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-400 animate-pulse">Загрузка графика...</span>
                </div>
              ) : !hasData ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                  <span className="text-4xl">📊</span>
                  <p className="mt-3 text-sm font-bold text-gray-500 text-center">Добавьте продажи,<br/>чтобы увидеть график</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {showDebtDetails ? (
                    <PieChart>
                      <Pie data={debtChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {debtChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={DEBT_COLORS[index % DEBT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={customTooltipFormatter} />
                    </PieChart>
                  ) : (
                    <PieChart>
                      <Pie data={mainChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onClick={(data) => { if(data.name === "В долгах") setShowDebtDetails(true); }} className="cursor-pointer">
                        {mainChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={customTooltipFormatter} />
                      <Legend wrapperStyle={{ fontWeight: 'black', fontSize: '14px', paddingTop: '15px' }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>

            {showDebtDetails && hasData && (
              <div className="w-full mt-4 max-h-40 overflow-y-auto pr-2">
                {debtChartData.map((d, i) => (
                  <div key={i} className="flex justify-between border-b py-3 text-sm md:text-base border-gray-100">
                    <span className="truncate pr-2 font-bold text-gray-700">{d.name}</span>
                    <span className="font-black text-red-500">{d.value.toLocaleString("ru-RU")} ₸</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
          <input type="text" placeholder="🔍 Поиск компании..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-5 py-4 text-lg font-black text-gray-900 placeholder:text-gray-500 placeholder:font-bold border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white" />

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 w-full">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-5 py-4 text-lg font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white cursor-pointer">
              <option value="all">Все записи</option>
              <option value="debtors">⚠️ Только должники</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-5 py-4 text-lg font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white cursor-pointer">
              <option value="date_desc">Новые сверху</option>
              <option value="amount_desc">Крупные суммы</option>
            </select>
          </div>
        </div>
        
        {/* Мобильная версия */}
        <div className="block lg:hidden space-y-4">
          {processedSales.map((sale) => {
            const debt = Number(sale.amount) - Number(sale.paid_amount);
            return (
              <div key={sale.id} className={`p-6 rounded-2xl border-2 shadow-sm bg-white
                  ${sale.status === 'paid' ? 'border-emerald-300' : ''}
                  ${sale.status === 'partial' ? 'border-amber-300' : ''}
                  ${sale.status === 'debt' ? 'border-rose-300' : ''}
              `}>
                <div className="flex justify-between items-start border-b-2 border-gray-100 pb-4 mb-4">
                  <h3 className="font-black text-2xl text-gray-900 leading-tight">{sale.company_name}</h3>
                  <span className="text-sm font-bold text-gray-500 shrink-0">{new Date(sale.sale_date).toLocaleDateString('ru-RU')}</span>
                </div>
                
                <div className="mb-5">
                  <ul className="space-y-2">
                    {sale.items.map((item, idx) => (
                      <li key={idx} className="text-base font-bold text-gray-800">
                        • {item.name} <span className="text-gray-500 font-black ml-1">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="text-xl font-black text-gray-900">Итого: {sale.amount.toLocaleString("ru-RU")} ₸</div>
                  {sale.status !== 'paid' && (
                    <div className="mt-3 flex justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-emerald-700 text-sm font-bold">Опл: {sale.paid_amount.toLocaleString("ru-RU")}</div>
                      <div className="text-rose-600 text-base font-black">Долг: {debt.toLocaleString("ru-RU")}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <select value={sale.status} onChange={(e) => handleStatusChange(sale.id, e.target.value, sale.amount, sale.paid_amount)}
                    className={`flex-1 text-base font-black p-4 rounded-xl border-2 outline-none cursor-pointer
                      ${sale.status === 'paid' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : ''}
                      ${sale.status === 'partial' ? 'bg-amber-100 text-amber-900 border-amber-400' : ''}
                      ${sale.status === 'debt' ? 'bg-rose-100 text-rose-900 border-rose-400' : ''}
                    `}>
                    <option value="paid">✅ Оплачено</option>
                    <option value="partial">⏳ Частично</option>
                    <option value="debt">❌ В долг</option>
                  </select>
                  <button onClick={() => handleDelete(sale.id)} className="p-4 bg-red-100 text-red-600 rounded-xl font-bold border-2 border-red-300">
                     Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ПК версия */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-base">
                <th className="p-5 font-black uppercase">Дата</th>
                <th className="p-5 font-black uppercase">Организация</th>
                <th className="p-5 font-black uppercase">Товары</th>
                <th className="p-5 font-black uppercase">Финансы</th>
                <th className="p-5 font-black uppercase">Статус</th>
                <th className="p-5 font-black uppercase text-center">Удал.</th>
              </tr>
            </thead>
            <tbody>
              {processedSales.map((sale) => {
                const debt = Number(sale.amount) - Number(sale.paid_amount);
                return (
                  <tr key={sale.id} className={`border-b-2 border-gray-100 hover:bg-gray-50
                    ${sale.status === 'paid' ? 'bg-emerald-50/50' : ''}
                    ${sale.status === 'partial' ? 'bg-amber-50/50' : ''}
                    ${sale.status === 'debt' ? 'bg-rose-50/50' : ''}
                  `}>
                    <td className="p-5 text-lg font-black text-gray-800 whitespace-nowrap">{new Date(sale.sale_date).toLocaleDateString('ru-RU')}</td>
                    <td className="p-5 text-xl font-black text-gray-900">{sale.company_name}</td>
                    <td className="p-5">
                      <ul className="space-y-1">{sale.items.map((item, idx) => (<li key={idx} className="text-base font-bold text-gray-800">• {item.name} <span className="text-gray-500 font-black ml-1">x{item.quantity}</span></li>))}</ul>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <div className="text-xl font-black text-gray-900">Итого: {sale.amount.toLocaleString("ru-RU")} ₸</div>
                      {sale.status !== 'paid' && (
                        <div className="mt-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <div className="text-emerald-700 text-sm font-bold">Опл: {sale.paid_amount.toLocaleString()} ₸</div>
                          <div className="text-rose-600 text-lg font-black">Долг: {debt.toLocaleString()} ₸</div>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <select value={sale.status} onChange={(e) => handleStatusChange(sale.id, e.target.value, sale.amount, sale.paid_amount)}
                        className={`text-lg font-black p-3 rounded-xl border-2 cursor-pointer
                          ${sale.status === 'paid' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : ''}
                          ${sale.status === 'partial' ? 'bg-amber-100 text-amber-900 border-amber-400' : ''}
                          ${sale.status === 'debt' ? 'bg-rose-100 text-rose-900 border-rose-400' : ''}
                        `}>
                        <option value="paid">✅ Оплачено</option>
                        <option value="partial">⏳ Частично</option>
                        <option value="debt">❌ В долг</option>
                      </select>
                    </td>
                    <td className="p-5 text-center">
                      <button onClick={() => handleDelete(sale.id)} className="p-3 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border-2 border-transparent hover:border-red-700 transition-colors shadow-sm">✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}