// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from "@/lib/supabase";
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// type SaleItem = { name: string; quantity: number };

// type Sale = {
//   id: number;
//   company_name: string;
//   amount: number;
//   paid_amount: number;
//   status: string;
//   sale_date: string;
//   items: SaleItem[];
// };

// export default function AdminDashboard() {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   // Форма
//   const [companyName, setCompanyName] = useState("");
//   const [amount, setAmount] = useState("");
//   const [paidAmount, setPaidAmount] = useState("");
//   const [status, setStatus] = useState("paid");
//   const [saleDate, setSaleDate] = useState("");
//   const [items, setItems] = useState<SaleItem[]>([{ name: "", quantity: 1 }]);

//   // Графики и фильтры
//   const [showDebtDetails, setShowDebtDetails] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all"); 
//   const [sortBy, setSortBy] = useState("date_desc"); 

//   const COLORS = ["#10B981", "#F43F5E"]; 
//   const DEBT_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#60a5fa", "#c084fc"];

//   const fetchSales = async () => {
//     const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
//     if (!error && data) setSales(data);
//   };

//   useEffect(() => {
//     setIsMounted(true);
//     fetchSales();
//   }, []);

//   const handleAddItem = () => setItems([...items, { name: "", quantity: 1 }]);
//   const handleItemChange = (index: number, field: string, value: string | number) => {
//     const newItems = [...items];
//     newItems[index] = { ...newItems[index], [field]: value };
//     setItems(newItems);
//   };
//   const handleRemoveItem = (index: number) => {
//     setItems(items.filter((_, i) => i !== index));
//   };

//   const handleAddSale = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const totalAmount = Number(amount);
//     let finalPaid = 0;
    
//     if (status === "paid") finalPaid = totalAmount;
//     if (status === "debt") finalPaid = 0;
//     if (status === "partial") finalPaid = Number(paidAmount);

//     const { error } = await supabase.from("sales").insert([
//       {
//         company_name: companyName,
//         amount: totalAmount,
//         paid_amount: finalPaid,
//         status: status,
//         sale_date: saleDate,
//         items: items,
//       },
//     ]);

//     if (!error) {
//       setCompanyName(""); setAmount(""); setPaidAmount(""); setStatus("paid"); setSaleDate("");
//       setItems([{ name: "", quantity: 1 }]);
//       fetchSales();
//     } else {
//       console.error(error);
//       alert("Ошибка: " + error.message);
//     }
//     setIsLoading(false);
//   };

//   const handleDelete = async (id: number) => {
//     if (confirm("Вы уверены, что хотите удалить эту запись?")) {
//       await supabase.from("sales").delete().eq("id", id);
//       fetchSales();
//     }
//   };

//   const handleStatusChange = async (id: number, newStatus: string, totalAmount: number, currentPaid: number) => {
//     let newPaid = currentPaid;
//     if (newStatus === "paid") newPaid = totalAmount;
//     if (newStatus === "debt") newPaid = 0;
//     if (newStatus === "partial") {
//       const userInput = prompt(`Общая сумма ${totalAmount} ₸. Сколько уже оплачено?`, currentPaid.toString());
//       if (userInput === null) return; 
//       newPaid = Number(userInput);
//     }
//     await supabase.from("sales").update({ status: newStatus, paid_amount: newPaid }).eq("id", id);
//     fetchSales();
//   };

//   let processedSales = [...sales];
//   if (searchTerm) {
//     processedSales = processedSales.filter(sale => sale.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
//   }
//   if (filterStatus === "debtors") {
//     processedSales = processedSales.filter(sale => sale.status === "debt" || sale.status === "partial");
//   }

//   processedSales.sort((a, b) => {
//     if (sortBy === "date_desc") return new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime();
//     if (sortBy === "date_asc") return new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime();
//     if (sortBy === "amount_desc") return b.amount - a.amount;
//     if (sortBy === "amount_asc") return a.amount - b.amount;
//     return 0;
//   });

//   const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.paid_amount), 0);
//   const totalDebt = sales.reduce((acc, sale) => acc + (Number(sale.amount) - Number(sale.paid_amount)), 0);
  
//   const hasData = totalRevenue > 0 || totalDebt > 0;

//   const mainChartData = [
//     { name: "Оплачено", value: totalRevenue },
//     { name: "В долгах", value: totalDebt },
//   ];

//   const debtByCompany = sales
//     .filter(sale => sale.status !== 'paid')
//     .reduce((acc: any, sale) => {
//       const debt = Number(sale.amount) - Number(sale.paid_amount);
//       if (debt > 0) acc[sale.company_name] = (acc[sale.company_name] || 0) + debt;
//       return acc;
//     }, {});

//   const debtChartData = Object.keys(debtByCompany).map((key) => ({ name: key, value: debtByCompany[key] }));

//   const customTooltipFormatter = (value: any, name: any) => {
//     return [`${Number(value || 0).toLocaleString("ru-RU")} ₸`, name];
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Дашборд</h1>
//           <a href="/" className="px-5 py-3 bg-slate-200 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-300">
//             На сайт →
//           </a>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
//           <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-2xl shadow-md border border-gray-200">
//             <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6">Новая реализация</h2>
//             <form onSubmit={handleAddSale} className="space-y-6">
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//                 <div className="flex flex-col gap-2">
//                   <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Организация / БИН</label>
//                   <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} type="text" placeholder="ТОО / ИП / Школа" 
//                     className="w-full px-5 py-4 text-xl md:text-2xl font-black text-gray-900 placeholder:text-gray-500 placeholder:font-bold border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
//                 </div>
//                 <div className="flex flex-col gap-2">
//                   <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Дата отгрузки</label>
//                   <input required value={saleDate} onChange={(e) => setSaleDate(e.target.value)} type="date" 
//                     className="w-full px-5 py-4 text-xl md:text-2xl font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white" />
//                 </div>
//               </div>

//               <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
//                 <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Проданные позиции</label>
//                 {items.map((item, index) => (
//                   <div key={index} className="flex flex-col md:flex-row gap-3">
//                     <input required value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} type="text" placeholder="Название (например, Парта)" 
//                       className="w-full px-5 py-4 text-lg md:text-xl font-black text-gray-900 placeholder:text-gray-500 placeholder:font-bold border-2 border-gray-400 rounded-xl focus:border-blue-600 focus:ring-4 outline-none bg-white" />
                    
//                     <div className="flex gap-3">
//                       <input required value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} type="number" min="1" placeholder="Шт." 
//                         className="w-full md:w-32 px-5 py-4 text-xl font-black text-gray-900 placeholder:text-gray-500 border-2 border-gray-400 rounded-xl text-center focus:border-blue-600 focus:ring-4 outline-none bg-white" />
                      
//                       {items.length > 1 && (
//                         <button type="button" onClick={() => handleRemoveItem(index)} className="px-5 py-4 bg-red-100 text-red-700 font-black rounded-xl border-2 border-red-200 hover:bg-red-200 shrink-0">✕</button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//                 <button type="button" onClick={handleAddItem} className="text-sm md:text-base text-blue-700 font-black hover:underline mt-2">+ Добавить еще позицию</button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//                 <div className="flex flex-col gap-2">
//                   <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Сумма (₸)</label>
//                   <input required value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" 
//                     className="w-full px-5 py-4 text-2xl md:text-3xl font-black text-gray-900 placeholder:text-gray-400 border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white" />
//                 </div>
                
//                 <div className="flex flex-col gap-2 md:col-span-1">
//                   <label className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Статус</label>
//                   <select value={status} onChange={(e) => setStatus(e.target.value)} 
//                     className="w-full px-5 py-4 text-xl font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white cursor-pointer">
//                     <option value="paid">✅ Оплачено</option>
//                     <option value="partial">⏳ Частично</option>
//                     <option value="debt">❌ В долг</option>
//                   </select>
//                 </div>

//                 {status === "partial" && (
//                   <div className="flex flex-col gap-2">
//                     <label className="text-xs md:text-sm font-bold text-amber-800 uppercase tracking-wide">Внесли (₸)</label>
//                     <input required value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} type="number" placeholder="0" 
//                       className="w-full px-5 py-4 text-2xl md:text-3xl font-black text-amber-950 placeholder:text-amber-700/60 border-2 border-amber-500 bg-amber-50 rounded-xl focus:border-amber-600 outline-none" />
//                   </div>
//                 )}
//               </div>

//               <button disabled={isLoading} type="submit" className="w-full md:w-auto mt-4 px-10 py-5 text-xl font-black bg-blue-600 text-white rounded-xl border-b-4 border-blue-800 hover:bg-blue-500 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 uppercase tracking-wider">
//                 {isLoading ? "Сохранение..." : "💾 Сохранить в базу"}
//               </button>
//             </form>
//           </div>

//           <div className="bg-white p-5 md:p-8 rounded-2xl shadow-md border border-gray-200 flex flex-col items-start justify-start">
//             <h2 className="text-lg md:text-xl font-black text-gray-900 w-full text-left mb-2">
//               {showDebtDetails ? "Должники" : "Выручка vs Долги"}
//             </h2>
            
//             {showDebtDetails && hasData && (
//                <button onClick={() => setShowDebtDetails(false)} className="text-sm text-blue-600 mb-2 w-full text-left font-bold hover:underline">
//                  ← Назад к графику
//                </button>
//             )}

//             <div className="h-64 w-full mt-4">
//               {!isMounted ? (
//                 <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
//                   <span className="text-sm font-bold text-gray-400 animate-pulse">Загрузка графика...</span>
//                 </div>
//               ) : !hasData ? (
//                 <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
//                   <span className="text-4xl">📊</span>
//                   <p className="mt-3 text-sm font-bold text-gray-500 text-center">Добавьте продажи,<br/>чтобы увидеть график</p>
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   {showDebtDetails ? (
//                     <PieChart>
//                       <Pie data={debtChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
//                         {debtChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={DEBT_COLORS[index % DEBT_COLORS.length]} />)}
//                       </Pie>
//                       <Tooltip formatter={customTooltipFormatter} />
//                     </PieChart>
//                   ) : (
//                     <PieChart>
//                       <Pie data={mainChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onClick={(data) => { if(data.name === "В долгах") setShowDebtDetails(true); }} className="cursor-pointer">
//                         {mainChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
//                       </Pie>
//                       <Tooltip formatter={customTooltipFormatter} />
//                       <Legend wrapperStyle={{ fontWeight: 'black', fontSize: '14px', paddingTop: '15px' }} />
//                     </PieChart>
//                   )}
//                 </ResponsiveContainer>
//               )}
//             </div>

//             {showDebtDetails && hasData && (
//               <div className="w-full mt-4 max-h-40 overflow-y-auto pr-2">
//                 {debtChartData.map((d, i) => (
//                   <div key={i} className="flex justify-between border-b py-3 text-sm md:text-base border-gray-100">
//                     <span className="truncate pr-2 font-bold text-gray-700">{d.name}</span>
//                     <span className="font-black text-red-500">{d.value.toLocaleString("ru-RU")} ₸</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
//           <input type="text" placeholder="🔍 Поиск компании..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full md:w-1/3 px-5 py-4 text-lg font-black text-gray-900 placeholder:text-gray-500 placeholder:font-bold border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white" />

//           <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 w-full">
//             <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-5 py-4 text-lg font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white cursor-pointer">
//               <option value="all">Все записи</option>
//               <option value="debtors">⚠️ Только должники</option>
//             </select>
//             <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-5 py-4 text-lg font-black text-gray-900 border-2 border-gray-400 rounded-xl focus:border-blue-600 outline-none bg-white cursor-pointer">
//               <option value="date_desc">Новые сверху</option>
//               <option value="amount_desc">Крупные суммы</option>
//             </select>
//           </div>
//         </div>
        
//         {/* Мобильная версия */}
//         <div className="block lg:hidden space-y-4">
//           {processedSales.map((sale) => {
//             const debt = Number(sale.amount) - Number(sale.paid_amount);
//             return (
//               <div key={sale.id} className={`p-6 rounded-2xl border-2 shadow-sm bg-white
//                   ${sale.status === 'paid' ? 'border-emerald-300' : ''}
//                   ${sale.status === 'partial' ? 'border-amber-300' : ''}
//                   ${sale.status === 'debt' ? 'border-rose-300' : ''}
//               `}>
//                 <div className="flex justify-between items-start border-b-2 border-gray-100 pb-4 mb-4">
//                   <h3 className="font-black text-2xl text-gray-900 leading-tight">{sale.company_name}</h3>
//                   <span className="text-sm font-bold text-gray-500 shrink-0">{new Date(sale.sale_date).toLocaleDateString('ru-RU')}</span>
//                 </div>
                
//                 <div className="mb-5">
//                   <ul className="space-y-2">
//                     {sale.items.map((item, idx) => (
//                       <li key={idx} className="text-base font-bold text-gray-800">
//                         • {item.name} <span className="text-gray-500 font-black ml-1">x{item.quantity}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>

//                 <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-200">
//                   <div className="text-xl font-black text-gray-900">Итого: {sale.amount.toLocaleString("ru-RU")} ₸</div>
//                   {sale.status !== 'paid' && (
//                     <div className="mt-3 flex justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
//                       <div className="text-emerald-700 text-sm font-bold">Опл: {sale.paid_amount.toLocaleString("ru-RU")}</div>
//                       <div className="text-rose-600 text-base font-black">Долг: {debt.toLocaleString("ru-RU")}</div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex gap-3">
//                   <select value={sale.status} onChange={(e) => handleStatusChange(sale.id, e.target.value, sale.amount, sale.paid_amount)}
//                     className={`flex-1 text-base font-black p-4 rounded-xl border-2 outline-none cursor-pointer
//                       ${sale.status === 'paid' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : ''}
//                       ${sale.status === 'partial' ? 'bg-amber-100 text-amber-900 border-amber-400' : ''}
//                       ${sale.status === 'debt' ? 'bg-rose-100 text-rose-900 border-rose-400' : ''}
//                     `}>
//                     <option value="paid">✅ Оплачено</option>
//                     <option value="partial">⏳ Частично</option>
//                     <option value="debt">❌ В долг</option>
//                   </select>
//                   <button onClick={() => handleDelete(sale.id)} className="p-4 bg-red-100 text-red-600 rounded-xl font-bold border-2 border-red-300">
//                      Удалить
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* ПК версия */}
//         <div className="hidden lg:block bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-900 text-white text-base">
//                 <th className="p-5 font-black uppercase">Дата</th>
//                 <th className="p-5 font-black uppercase">Организация</th>
//                 <th className="p-5 font-black uppercase">Товары</th>
//                 <th className="p-5 font-black uppercase">Финансы</th>
//                 <th className="p-5 font-black uppercase">Статус</th>
//                 <th className="p-5 font-black uppercase text-center">Удал.</th>
//               </tr>
//             </thead>
//             <tbody>
//               {processedSales.map((sale) => {
//                 const debt = Number(sale.amount) - Number(sale.paid_amount);
//                 return (
//                   <tr key={sale.id} className={`border-b-2 border-gray-100 hover:bg-gray-50
//                     ${sale.status === 'paid' ? 'bg-emerald-50/50' : ''}
//                     ${sale.status === 'partial' ? 'bg-amber-50/50' : ''}
//                     ${sale.status === 'debt' ? 'bg-rose-50/50' : ''}
//                   `}>
//                     <td className="p-5 text-lg font-black text-gray-800 whitespace-nowrap">{new Date(sale.sale_date).toLocaleDateString('ru-RU')}</td>
//                     <td className="p-5 text-xl font-black text-gray-900">{sale.company_name}</td>
//                     <td className="p-5">
//                       <ul className="space-y-1">{sale.items.map((item, idx) => (<li key={idx} className="text-base font-bold text-gray-800">• {item.name} <span className="text-gray-500 font-black ml-1">x{item.quantity}</span></li>))}</ul>
//                     </td>
//                     <td className="p-5 whitespace-nowrap">
//                       <div className="text-xl font-black text-gray-900">Итого: {sale.amount.toLocaleString("ru-RU")} ₸</div>
//                       {sale.status !== 'paid' && (
//                         <div className="mt-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
//                           <div className="text-emerald-700 text-sm font-bold">Опл: {sale.paid_amount.toLocaleString()} ₸</div>
//                           <div className="text-rose-600 text-lg font-black">Долг: {debt.toLocaleString()} ₸</div>
//                         </div>
//                       )}
//                     </td>
//                     <td className="p-5">
//                       <select value={sale.status} onChange={(e) => handleStatusChange(sale.id, e.target.value, sale.amount, sale.paid_amount)}
//                         className={`text-lg font-black p-3 rounded-xl border-2 cursor-pointer
//                           ${sale.status === 'paid' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : ''}
//                           ${sale.status === 'partial' ? 'bg-amber-100 text-amber-900 border-amber-400' : ''}
//                           ${sale.status === 'debt' ? 'bg-rose-100 text-rose-900 border-rose-400' : ''}
//                         `}>
//                         <option value="paid">✅ Оплачено</option>
//                         <option value="partial">⏳ Частично</option>
//                         <option value="debt">❌ В долг</option>
//                       </select>
//                     </td>
//                     <td className="p-5 text-center">
//                       <button onClick={() => handleDelete(sale.id)} className="p-3 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border-2 border-transparent hover:border-red-700 transition-colors shadow-sm">✕</button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }



// ------------------------


// version 2.0 



// ------------------------


// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from "@/lib/supabase";
// import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// type SaleItem = { name: string; quantity: number; price?: number | "" };

// type Sale = {
//   id: number;
//   company_name: string;
//   amount: number;
//   paid_amount: number;
//   status: string;
//   sale_date: string;
//   items: SaleItem[];
// };

// export default function AdminDashboard() {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);

//   // Табы для мобилки: 'form', 'data', 'third'
//   const [activeTab, setActiveTab] = useState<'form' | 'data' | 'third'>('form');

//   // Форма
//   const [companyName, setCompanyName] = useState("");
//   const [amount, setAmount] = useState("");
//   const [paidAmount, setPaidAmount] = useState("");
//   const [status, setStatus] = useState("paid");
//   const [saleDate, setSaleDate] = useState("");
//   const [items, setItems] = useState<SaleItem[]>([{ name: "", quantity: 1, price: "" }]);

//   // Графики и фильтры
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("all"); 
//   const [sortBy, setSortBy] = useState("date_desc"); 

//   const COLORS = ["#85C78F", "#F2727B"];

//   const fetchSales = async () => {
//     const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
//     if (!error && data) setSales(data);
//   };

//   useEffect(() => {
//     setIsMounted(true);
//     fetchSales();
//   }, []);

//   // Автоматический подсчет суммы при изменении позиций
//   useEffect(() => {
//     // Проверяем, есть ли хотя бы у одной позиции введенная цена
//     const hasAnyPrice = items.some(item => item.price !== undefined && item.price !== "");
    
//     if (hasAnyPrice) {
//       const calculatedTotal = items.reduce((sum, item) => {
//         const itemPrice = Number(item.price) || 0;
//         const itemQty = Number(item.quantity) || 0;
//         return sum + (itemPrice * itemQty);
//       }, 0);
//       setAmount(calculatedTotal.toString());
//     }
//   }, [items]); // Эффект срабатывает только при изменении массива items

//   const handleAddItem = () => setItems([...items, { name: "", quantity: 1, price: "" }]);
  
//   const handleItemChange = (index: number, field: string, value: string | number) => {
//     const newItems = [...items];
//     newItems[index] = { ...newItems[index], [field]: value };
//     setItems(newItems);
//   };
  
//   const handleRemoveItem = (index: number) => {
//     setItems(items.filter((_, i) => i !== index));
//   };

//   const handleAddSale = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const totalAmount = Number(amount);
//     let finalPaid = 0;
    
//     if (status === "paid") finalPaid = totalAmount;
//     if (status === "debt") finalPaid = 0;
//     if (status === "partial") finalPaid = Number(paidAmount);

//     const { error } = await supabase.from("sales").insert([
//       {
//         company_name: companyName,
//         amount: totalAmount,
//         paid_amount: finalPaid,
//         status: status,
//         sale_date: saleDate,
//         items: items,
//       },
//     ]);

//     if (!error) {
//       setCompanyName(""); setAmount(""); setPaidAmount(""); setStatus("paid"); setSaleDate("");
//       setItems([{ name: "", quantity: 1, price: "" }]);
//       fetchSales();
//       setActiveTab('data');
//     } else {
//       console.error(error);
//       alert("Ошибка: " + error.message);
//     }
//     setIsLoading(false);
//   };

//   const handleDelete = async (id: number) => {
//     if (confirm("Вы уверены, что хотите удалить эту запись?")) {
//       await supabase.from("sales").delete().eq("id", id);
//       fetchSales();
//     }
//   };

//   const handleStatusChange = async (id: number, newStatus: string, totalAmount: number, currentPaid: number) => {
//     let newPaid = currentPaid;
//     if (newStatus === "paid") newPaid = totalAmount;
//     if (newStatus === "debt") newPaid = 0;
//     if (newStatus === "partial") {
//       const userInput = prompt(`Общая сумма ${totalAmount} ₸. Сколько уже оплачено?`, currentPaid.toString());
//       if (userInput === null) return; 
//       newPaid = Number(userInput);
//     }
//     await supabase.from("sales").update({ status: newStatus, paid_amount: newPaid }).eq("id", id);
//     fetchSales();
//   };

//   let processedSales = [...sales];
//   if (searchTerm) {
//     processedSales = processedSales.filter(sale => sale.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
//   }
//   if (filterStatus === "debtors") {
//     processedSales = processedSales.filter(sale => sale.status === "debt" || sale.status === "partial");
//   }

//   processedSales.sort((a, b) => {
//     if (sortBy === "date_desc") return new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime();
//     if (sortBy === "date_asc") return new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime();
//     if (sortBy === "amount_desc") return b.amount - a.amount;
//     if (sortBy === "amount_asc") return a.amount - b.amount;
//     return 0;
//   });

//   const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.paid_amount), 0);
//   const totalDebt = sales.reduce((acc, sale) => acc + (Number(sale.amount) - Number(sale.paid_amount)), 0);
//   const totalExpected = totalRevenue + totalDebt;
//   const hasData = totalRevenue > 0 || totalDebt > 0;

//   const paidPercentage = totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 0;
//   const debtPercentage = totalExpected > 0 ? (totalDebt / totalExpected) * 100 : 0;

//   const mainChartData = [
//     { name: "Получено", value: totalRevenue },
//     { name: "К получению (Долг)", value: totalDebt },
//   ];

//   const customTooltipFormatter = (value: any, name: any) => [`${Number(value || 0).toLocaleString("ru-RU")} ₸`, name];

//   // ================= РЕНДЕР КОМПОНЕНТОВ =================

//   const renderForm = () => (
//     <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
//       <h2 className="text-xl font-semibold text-slate-800 mb-6">Новая реализация</h2>
//       <form onSubmit={handleAddSale} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           <div className="flex flex-col gap-1.5">
//             <label className="text-sm font-medium text-slate-500">Организация / БИН</label>
//             <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} type="text" placeholder="ТОО / ИП / Школа" 
//               className="w-full px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
//           </div>
//           <div className="flex flex-col gap-1.5">
//             <label className="text-sm font-medium text-slate-500">Дата отгрузки</label>
//             <input required value={saleDate} onChange={(e) => setSaleDate(e.target.value)} type="date" 
//               className="w-full px-4 py-3 text-base text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
//           </div>
//         </div>

//         <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
//           <label className="text-sm font-medium text-slate-600 block mb-2">Проданные позиции</label>
//           {items.map((item, index) => (
//             <div key={index} className="flex flex-col xl:flex-row gap-3">
//               <input required value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} type="text" placeholder="Название товара" 
//                 className="flex-1 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white min-w-0" />
              
//               <div className="flex gap-2 w-full xl:w-auto">
//                 <input value={item.price} onChange={(e) => handleItemChange(index, "price", e.target.value)} type="number" min="0" placeholder="Цена (опц.)" 
//                   className="w-full xl:w-32 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none bg-white min-w-0" />
                
//                 <input required value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} type="number" min="1" placeholder="Шт." 
//                   className="w-20 xl:w-24 px-4 py-3 text-base text-slate-800 border border-slate-200 rounded-xl text-center focus:border-indigo-400 outline-none bg-white min-w-0" />
                
//                 {items.length > 1 && (
//                   <button type="button" onClick={() => handleRemoveItem(index)} className="px-3 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">✕</button>
//                 )}
//               </div>
//             </div>
//           ))}
//           <button type="button" onClick={handleAddItem} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors mt-2">
//             + Добавить позицию
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-100 pt-6">
//           <div className="flex flex-col gap-1.5">
//             <label className="text-sm font-medium text-slate-500">Итоговая сумма (₸)</label>
//             <input required value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" 
//               className="w-full px-4 py-3 text-lg font-semibold text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none transition-colors" />
//           </div>
          
//           <div className="flex flex-col gap-1.5 md:col-span-1">
//             <label className="text-sm font-medium text-slate-500">Статус оплаты</label>
//             <select value={status} onChange={(e) => setStatus(e.target.value)} 
//               className="w-full px-4 py-3 text-base text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none bg-white cursor-pointer">
//               <option value="paid">✅ Оплачено полностью</option>
//               <option value="partial">⏳ Частично оплачено</option>
//               <option value="debt">❌ В долг (без оплаты)</option>
//             </select>
//           </div>

//           {status === "partial" && (
//             <div className="flex flex-col gap-1.5">
//               <label className="text-sm font-medium text-orange-500">Сколько внесли (₸)</label>
//               <input required value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} type="number" placeholder="0" 
//                 className="w-full px-4 py-3 text-lg font-semibold text-orange-800 border border-orange-200 bg-orange-50 rounded-xl focus:border-orange-400 outline-none" />
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end pt-4">
//           <button disabled={isLoading} type="submit" className="w-full md:w-auto px-8 py-3 text-base font-medium bg-[#6672E5] text-white rounded-xl shadow-sm hover:bg-[#5560c9] transition-all disabled:opacity-50">
//             {isLoading ? "Сохранение..." : "Сохранить заказ"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );

//   const renderDataAndCharts = () => (
//     <div className="space-y-6">
//       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//         <h3 className="text-sm font-medium text-slate-500 mb-1">Общая ожидаемая сумма</h3>
//         <p className="text-2xl font-semibold text-slate-800 mb-6">{totalExpected.toLocaleString("ru-RU")} ₸</p>
        
//         <div className="w-full h-3 rounded-full flex overflow-hidden mb-4 bg-slate-100">
//           <div style={{ width: `${paidPercentage}%`, backgroundColor: COLORS[0] }} className="h-full transition-all duration-500" />
//           <div style={{ width: `${debtPercentage}%`, backgroundColor: COLORS[1] }} className="h-full transition-all duration-500" />
//         </div>

//         <div className="flex justify-between items-center text-sm">
//           <div>
//             <p className="text-slate-400 mb-1">Получено</p>
//             <p className="font-semibold" style={{ color: COLORS[0] }}>{totalRevenue.toLocaleString("ru-RU")} ₸</p>
//           </div>
//           <div className="text-right">
//             <p className="text-slate-400 mb-1">К получению (Долг)</p>
//             <p className="font-semibold" style={{ color: COLORS[1] }}>{totalDebt.toLocaleString("ru-RU")} ₸</p>
//           </div>
//         </div>

//         <div className="h-48 w-full mt-6">
//           {!isMounted ? null : hasData ? (
//              <ResponsiveContainer width="100%" height="100%">
//                <PieChart>
//                  <Pie data={mainChartData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
//                    {mainChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
//                  </Pie>
//                  <Tooltip formatter={customTooltipFormatter} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
//                </PieChart>
//              </ResponsiveContainer>
//           ) : (
//             <div className="h-full flex items-center justify-center text-slate-400 text-sm">Нет данных</div>
//           )}
//         </div>
//       </div>

//       <div className="flex flex-col sm:flex-row gap-3">
//         <input type="text" placeholder="Поиск компании..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//           className="flex-1 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none bg-white" />
//         <div className="flex gap-3">
//           <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-xl outline-none bg-white">
//             <option value="all">Все статусы</option>
//             <option value="debtors">Только должники</option>
//           </select>
//           <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-xl outline-none bg-white">
//             <option value="date_desc">Новые</option>
//             <option value="amount_desc">Сумма</option>
//           </select>
//         </div>
//       </div>

//       <div className="space-y-4">
//         {processedSales.map((sale) => {
//           const debt = Number(sale.amount) - Number(sale.paid_amount);
//           return (
//             <div key={sale.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h3 className="font-semibold text-lg text-slate-800">{sale.company_name}</h3>
//                   <span className="text-xs text-slate-400">{new Date(sale.sale_date).toLocaleDateString('ru-RU')}</span>
//                 </div>
//                 <div className="text-right">
//                   <div className="font-semibold text-slate-800">{sale.amount.toLocaleString("ru-RU")} ₸</div>
//                   {sale.status !== 'paid' && (
//                     <div className="text-xs font-medium mt-1 text-[#F2727B]">Долг: {debt.toLocaleString("ru-RU")} ₸</div>
//                   )}
//                 </div>
//               </div>

//               <div className="text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-xl">
//                 {sale.items.map((item, idx) => (
//                   <div key={idx} className="flex justify-between mb-1 last:mb-0 items-center">
//                     <span className="font-medium">{item.name}</span>
//                     <div className="flex gap-3 text-slate-400 text-xs">
//                       {item.price && <span>{Number(item.price).toLocaleString("ru-RU")} ₸</span>}
//                       <span>x{item.quantity}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="flex justify-between items-center pt-2 border-t border-slate-50">
//                  <select value={sale.status} onChange={(e) => handleStatusChange(sale.id, e.target.value, sale.amount, sale.paid_amount)}
//                     className={`text-sm py-1.5 px-3 rounded-lg border outline-none cursor-pointer font-medium
//                       ${sale.status === 'paid' ? 'bg-[#85C78F]/10 text-[#55945e] border-[#85C78F]/30' : ''}
//                       ${sale.status === 'partial' ? 'bg-orange-50 text-orange-600 border-orange-200' : ''}
//                       ${sale.status === 'debt' ? 'bg-[#F2727B]/10 text-[#d15059] border-[#F2727B]/30' : ''}
//                     `}>
//                     <option value="paid">Оплачено</option>
//                     <option value="partial">Частично</option>
//                     <option value="debt">В долг</option>
//                   </select>
//                   <button onClick={() => handleDelete(sale.id)} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
//                      Удалить
//                   </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans pb-24 lg:pb-8 flex">
//       <div className="hidden lg:flex w-64 flex-col bg-[#F0F3F7] border-r border-slate-200 fixed h-full left-0 top-0">
//         <div className="p-6">
//           <h1 className="text-xl font-bold text-slate-800 tracking-tight">CRM</h1>
//         </div>
//         <nav className="flex-1 px-4 space-y-2">
//           <button onClick={() => setActiveTab('form')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'form' ? 'bg-white text-[#6672E5] shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
//             <span className="text-lg">📝</span> Ввод данных
//           </button>
//           <button onClick={() => setActiveTab('data')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-white text-[#6672E5] shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
//             <span className="text-lg">📊</span> Финансы и база
//           </button>
//           <button onClick={() => setActiveTab('third')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'third' ? 'bg-white text-[#6672E5] shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
//             <span className="text-lg">⚙️</span> Настройки
//           </button>
//         </nav>
//       </div>

//       <div className="flex-1 lg:ml-64 p-4 md:p-8 max-w-5xl mx-auto w-full">
//         <div className="flex items-center justify-between mb-8 lg:hidden">
//           <h1 className="text-2xl font-bold text-slate-800">CRM</h1>
//           <a href="/" className="text-sm text-[#6672E5] font-medium">На сайт →</a>
//         </div>

//         <div className="hidden lg:flex justify-end mb-8">
//             <a href="/" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">На сайт →</a>
//         </div>

//         {activeTab === 'form' && renderForm()}
//         {activeTab === 'data' && renderDataAndCharts()}
//         {activeTab === 'third' && (
//           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
//             <p className="text-slate-500">Здесь можно разместить профиль, настройки доступа или экспорт отчетов.</p>
//           </div>
//         )}
//       </div>

//       <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 px-2 pb-safe pt-2">
//         <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center p-2 min-w-[80px] transition-colors ${activeTab === 'form' ? 'text-[#6672E5]' : 'text-slate-400'}`}>
//           <span className="text-xl mb-1">📝</span>
//           <span className="text-[10px] font-medium">Ввод</span>
//         </button>
//         <button onClick={() => setActiveTab('data')} className={`flex flex-col items-center p-2 min-w-[80px] transition-colors ${activeTab === 'data' ? 'text-[#6672E5]' : 'text-slate-400'}`}>
//           <span className="text-xl mb-1">📊</span>
//           <span className="text-[10px] font-medium">База</span>
//         </button>
//         <button onClick={() => setActiveTab('third')} className={`flex flex-col items-center p-2 min-w-[80px] transition-colors ${activeTab === 'third' ? 'text-[#6672E5]' : 'text-slate-400'}`}>
//           <span className="text-xl mb-1">⚙️</span>
//           <span className="text-[10px] font-medium">Настройки</span>
//         </button>
//       </div>
//     </div>
//   );
// }



// -------------------
// Update 3 

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type SaleItem = { name: string; quantity: number; price?: number | "" };

type Sale = {
  id: number;
  company_name: string;
  amount: number;
  paid_amount: number;
  status: string;
  payment_method: string;
  sale_date: string;
  items: SaleItem[];
  created_at: string;
  updated_at: string; 
};

export default function AdminDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<'form' | 'data' | 'third'>('form');

  // Форма
  const [companyName, setCompanyName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [status, setStatus] = useState("paid");
  const [paymentMethod, setPaymentMethod] = useState("invoice"); 
  const [saleDate, setSaleDate] = useState("");
  const [items, setItems] = useState<SaleItem[]>([{ name: "", quantity: 1, price: "" }]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [sortBy, setSortBy] = useState("date_desc"); 

  const COLORS = ["#85C78F", "#F2727B"];

  const fetchSales = async () => {
    const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
    if (!error && data) setSales(data);
  };

  useEffect(() => {
    setIsMounted(true);
    fetchSales();
  }, []);

  useEffect(() => {
    const hasAnyPrice = items.some(item => item.price !== undefined && item.price !== "");
    if (hasAnyPrice) {
      const calculatedTotal = items.reduce((sum, item) => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 0;
        return sum + (itemPrice * itemQty);
      }, 0);
      setAmount(calculatedTotal.toString());
    }
  }, [items]);

  const handleAddItem = () => setItems([...items, { name: "", quantity: 1, price: "" }]);
  
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
        payment_method: paymentMethod, 
        sale_date: saleDate,
        items: items,
        updated_at: new Date().toISOString(), 
      },
    ]);

    if (!error) {
      setCompanyName(""); setAmount(""); setPaidAmount(""); setStatus("paid"); setPaymentMethod("invoice"); setSaleDate("");
      setItems([{ name: "", quantity: 1, price: "" }]);
      fetchSales();
      setActiveTab('data');
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
    
    await supabase.from("sales").update({ 
      status: newStatus, 
      paid_amount: newPaid,
      updated_at: new Date().toISOString() 
    }).eq("id", id);
    
    fetchSales();
  };

  // НОВАЯ ФУНКЦИЯ: Изменение способа оплаты
  const handlePaymentMethodChange = async (id: number, newMethod: string) => {
    await supabase.from("sales").update({ 
      payment_method: newMethod,
      updated_at: new Date().toISOString() 
    }).eq("id", id);
    
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
  const totalExpected = totalRevenue + totalDebt;
  const hasData = totalRevenue > 0 || totalDebt > 0;

  const paidPercentage = totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 0;
  const debtPercentage = totalExpected > 0 ? (totalDebt / totalExpected) * 100 : 0;

  const mainChartData = [
    { name: "Получено", value: totalRevenue },
    { name: "К получению (Долг)", value: totalDebt },
  ];

  const customTooltipFormatter = (value: any, name: any) => [`${Number(value || 0).toLocaleString("ru-RU")} ₸`, name];

  // ================= РЕНДЕР КОМПОНЕНТОВ =================

  const renderForm = () => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Новая реализация</h2>
      <form onSubmit={handleAddSale} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-500">Организация / БИН</label>
            <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} type="text" placeholder="ТОО / ИП / Школа" 
              className="w-full px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-500">Дата отгрузки</label>
            <input required value={saleDate} onChange={(e) => setSaleDate(e.target.value)} type="date" 
              className="w-full px-4 py-3 text-base text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
          <label className="text-sm font-medium text-slate-600 block mb-2">Проданные позиции</label>
          {items.map((item, index) => (
            <div key={index} className="flex flex-col xl:flex-row gap-3">
              <input required value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} type="text" placeholder="Название товара" 
                className="flex-1 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none bg-white min-w-0" />
              
              <div className="flex gap-2 w-full xl:w-auto">
                <input value={item.price} onChange={(e) => handleItemChange(index, "price", e.target.value)} type="number" min="0" placeholder="Цена (опц.)" 
                  className="w-full xl:w-32 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none bg-white min-w-0" />
                
                <input required value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} type="number" min="1" placeholder="Шт." 
                  className="w-20 xl:w-24 px-4 py-3 text-base text-slate-800 border border-slate-200 rounded-xl text-center focus:border-indigo-400 outline-none bg-white min-w-0" />
                
                {items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(index)} className="px-3 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">✕</button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors mt-2">
            + Добавить позицию
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 border-t border-slate-100 pt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-500">Итого (₸)</label>
            <input required value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" 
              className="w-full px-4 py-3 text-lg font-semibold text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none transition-colors" />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-500">Способ оплаты</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} 
              className="w-full px-4 py-3 text-base text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none bg-white cursor-pointer">
              <option value="invoice">📄 По счёту</option>
              <option value="cash">💵 Наличными</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-500">Статус</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} 
              className="w-full px-4 py-3 text-base text-slate-800 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none bg-white cursor-pointer">
              <option value="paid">✅ Оплачено</option>
              <option value="partial">⏳ Частично</option>
              <option value="debt">❌ В долг</option>
            </select>
          </div>

          {status === "partial" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-orange-500">Внесли (₸)</label>
              <input required value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} type="number" placeholder="0" 
                className="w-full px-4 py-3 text-lg font-semibold text-orange-800 border border-orange-200 bg-orange-50 rounded-xl focus:border-orange-400 outline-none" />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button disabled={isLoading} type="submit" className="w-full md:w-auto px-8 py-3 text-base font-medium bg-[#6672E5] text-white rounded-xl shadow-sm hover:bg-[#5560c9] transition-all disabled:opacity-50">
            {isLoading ? "Сохранение..." : "Сохранить заказ"}
          </button>
        </div>
      </form>
    </div>
  );

  const renderDataAndCharts = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-medium text-slate-500 mb-1">Общая ожидаемая сумма</h3>
        <p className="text-2xl font-semibold text-slate-800 mb-6">{totalExpected.toLocaleString("ru-RU")} ₸</p>
        
        <div className="w-full h-3 rounded-full flex overflow-hidden mb-4 bg-slate-100">
          <div style={{ width: `${paidPercentage}%`, backgroundColor: COLORS[0] }} className="h-full transition-all duration-500" />
          <div style={{ width: `${debtPercentage}%`, backgroundColor: COLORS[1] }} className="h-full transition-all duration-500" />
        </div>

        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-slate-400 mb-1">Получено</p>
            <p className="font-semibold" style={{ color: COLORS[0] }}>{totalRevenue.toLocaleString("ru-RU")} ₸</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 mb-1">К получению (Долг)</p>
            <p className="font-semibold" style={{ color: COLORS[1] }}>{totalDebt.toLocaleString("ru-RU")} ₸</p>
          </div>
        </div>

        <div className="h-48 w-full mt-6">
          {!isMounted ? null : hasData ? (
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={mainChartData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                   {mainChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                 </Pie>
                 <Tooltip formatter={customTooltipFormatter} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">Нет данных</div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Поиск компании..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none bg-white" />
        <div className="flex gap-3">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-xl outline-none bg-white">
            <option value="all">Все статусы</option>
            <option value="debtors">Только должники</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-xl outline-none bg-white">
            <option value="date_desc">Новые</option>
            <option value="amount_desc">Сумма</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {processedSales.map((sale) => {
          const debt = Number(sale.amount) - Number(sale.paid_amount);
          
          const createdStr = sale.created_at ? new Date(sale.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '';
          const updatedStr = sale.updated_at ? new Date(sale.updated_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '';

          return (
            <div key={sale.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">{sale.company_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">Отгрузка: {new Date(sale.sale_date).toLocaleDateString('ru-RU')}</span>
                    
                    {/* ИНТЕРАКТИВНЫЙ БЕЙДЖ С ВЫБОРОМ СПОСОБА ОПЛАТЫ */}
                    <select 
                      value={sale.payment_method || 'invoice'} 
                      onChange={(e) => handlePaymentMethodChange(sale.id, e.target.value)}
                      className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md outline-none cursor-pointer border-none
                        ${sale.payment_method === 'cash' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                      `}
                    >
                      <option value="invoice">ПО СЧЁТУ</option>
                      <option value="cash">НАЛИЧНЫЕ</option>
                    </select>

                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800">{sale.amount.toLocaleString("ru-RU")} ₸</div>
                  {sale.status !== 'paid' && (
                    <div className="text-xs font-medium mt-1 text-[#F2727B]">Долг: {debt.toLocaleString("ru-RU")} ₸</div>
                  )}
                </div>
              </div>

              <div className="text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-xl">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between mb-1 last:mb-0 items-center">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex gap-3 text-slate-400 text-xs">
                      {item.price && <span>{Number(item.price).toLocaleString("ru-RU")} ₸</span>}
                      <span>x{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pt-2 border-t border-slate-50">
                <div className="flex flex-col text-[10px] text-slate-400">
                  {createdStr && <span>Добавлен: {createdStr}</span>}
                  {updatedStr && updatedStr !== createdStr && <span>Изменен: {updatedStr}</span>}
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <select value={sale.status} onChange={(e) => handleStatusChange(sale.id, e.target.value, sale.amount, sale.paid_amount)}
                      className={`text-sm py-1.5 px-3 rounded-lg border outline-none cursor-pointer font-medium flex-1 sm:flex-none
                        ${sale.status === 'paid' ? 'bg-[#85C78F]/10 text-[#55945e] border-[#85C78F]/30' : ''}
                        ${sale.status === 'partial' ? 'bg-orange-50 text-orange-600 border-orange-200' : ''}
                        ${sale.status === 'debt' ? 'bg-[#F2727B]/10 text-[#d15059] border-[#F2727B]/30' : ''}
                      `}>
                      <option value="paid">Оплачено</option>
                      <option value="partial">Частично</option>
                      <option value="debt">В долг</option>
                    </select>
                    <button onClick={() => handleDelete(sale.id)} className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
                       Удалить
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans pb-24 lg:pb-8 flex">
      <div className="hidden lg:flex w-64 flex-col bg-[#F0F3F7] border-r border-slate-200 fixed h-full left-0 top-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">CRM</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('form')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'form' ? 'bg-white text-[#6672E5] shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
            <span className="text-lg">📝</span> Ввод данных
          </button>
          <button onClick={() => setActiveTab('data')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'data' ? 'bg-white text-[#6672E5] shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
            <span className="text-lg">📊</span> Финансы и база
          </button>
          <button onClick={() => setActiveTab('third')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'third' ? 'bg-white text-[#6672E5] shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}>
            <span className="text-lg">⚙️</span> Настройки
          </button>
        </nav>
      </div>

      <div className="flex-1 lg:ml-64 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-2xl font-bold text-slate-800">CRM</h1>
          <a href="/" className="text-sm text-[#6672E5] font-medium">На сайт →</a>
        </div>

        <div className="hidden lg:flex justify-end mb-8">
            <a href="/" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">На сайт →</a>
        </div>

        {activeTab === 'form' && renderForm()}
        {activeTab === 'data' && renderDataAndCharts()}
        {activeTab === 'third' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-slate-500">Здесь можно разместить профиль, настройки доступа или экспорт отчетов.</p>
          </div>
        )}
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50 px-2 pb-safe pt-2">
        <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center p-2 min-w-[80px] transition-colors ${activeTab === 'form' ? 'text-[#6672E5]' : 'text-slate-400'}`}>
          <span className="text-xl mb-1">📝</span>
          <span className="text-[10px] font-medium">Ввод</span>
        </button>
        <button onClick={() => setActiveTab('data')} className={`flex flex-col items-center p-2 min-w-[80px] transition-colors ${activeTab === 'data' ? 'text-[#6672E5]' : 'text-slate-400'}`}>
          <span className="text-xl mb-1">📊</span>
          <span className="text-[10px] font-medium">База</span>
        </button>
        <button onClick={() => setActiveTab('third')} className={`flex flex-col items-center p-2 min-w-[80px] transition-colors ${activeTab === 'third' ? 'text-[#6672E5]' : 'text-slate-400'}`}>
          <span className="text-xl mb-1">⚙️</span>
          <span className="text-[10px] font-medium">Настройки</span>
        </button>
      </div>
    </div>
  );
}