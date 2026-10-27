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
import Link from "next/link";
import OfferBuilder from "@/components/admin/OfferBuilder";
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

  const [activeTab, setActiveTab] = useState<'form' | 'data' | 'offer'>('form');

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
  const [showDebtors, setShowDebtors] = useState(false); // раскрытый список должников под карточкой «Долг»

  const COLORS = ["#10b981", "#f43f5e"]; // получено / долг

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

  // Должники: долг по всем сделкам компании, от большего к меньшему
  const debtorsMap = new Map<string, { name: string; debt: number; deals: number; since: string }>();
  for (const sale of sales) {
    const debt = Number(sale.amount) - Number(sale.paid_amount);
    if (debt <= 0) continue;
    const key = sale.company_name.trim().toLowerCase();
    const d = debtorsMap.get(key) ?? { name: sale.company_name.trim(), debt: 0, deals: 0, since: sale.sale_date };
    d.debt += debt;
    d.deals += 1;
    if (sale.sale_date < d.since) d.since = sale.sale_date;
    debtorsMap.set(key, d);
  }
  const debtors = [...debtorsMap.values()].sort((a, b) => b.debt - a.debt);

  const showDebtorSales = (name: string) => {
    setSearchTerm(name);
    setFilterStatus("debtors");
    document.getElementById("sales-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const hasData = totalRevenue > 0 || totalDebt > 0;

  const paidPercentage = totalExpected > 0 ? (totalRevenue / totalExpected) * 100 : 0;
  const debtPercentage = totalExpected > 0 ? (totalDebt / totalExpected) * 100 : 0;

  const mainChartData = [
    { name: "Получено", value: totalRevenue },
    { name: "К получению (Долг)", value: totalDebt },
  ];

  const customTooltipFormatter = (value: any, name: any) => [`${Number(value || 0).toLocaleString("ru-RU")} ₸`, name];

  // ================= РЕНДЕР КОМПОНЕНТОВ =================

  const fmt = (n: number) => `${Number(n || 0).toLocaleString("ru-RU")}\u00a0₸`; // ₸ не отрывается от суммы

  const inputCls =
    "w-full px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none transition";
  const labelCls = "text-xs font-semibold uppercase tracking-wider text-slate-500";

  const STATUS_META: Record<string, { label: string; icon: string; chip: string; stripe: string }> = {
    paid: { label: "Оплачено", icon: "fa-circle-check", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", stripe: "bg-emerald-500" },
    partial: { label: "Частично", icon: "fa-hourglass-half", chip: "bg-amber-50 text-amber-700 border-amber-200", stripe: "bg-amber-400" },
    debt: { label: "В долг", icon: "fa-circle-xmark", chip: "bg-rose-50 text-rose-700 border-rose-200", stripe: "bg-rose-500" },
  };

  const PAYMENT_OPTIONS = [
    { value: "invoice", label: "По счёту", icon: "fa-file-invoice" },
    { value: "cash", label: "Наличными", icon: "fa-money-bill-wave" },
  ];

  const TABS = [
    { id: "form" as const, label: "Ввод данных", short: "Ввод", icon: "fa-pen-to-square", title: "Новая реализация", subtitle: "Запишите отгрузку: покупатель, позиции и оплата" },
    { id: "data" as const, label: "Финансы и база", short: "База", icon: "fa-chart-pie", title: "Финансы и база", subtitle: "Поступления, долги и все сделки" },
    { id: "offer" as const, label: "Конструктор КП", short: "КП", icon: "fa-file-word", title: "Коммерческое предложение", subtitle: "Соберите КП из товаров каталога и скачайте в Word" },
  ];
  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  // Переключатель-«таблетки» вместо выпадающего списка: то же значение, удобнее с телефона
  const segmented = (
    options: { value: string; label: string; icon: string }[],
    value: string,
    onChange: (v: string) => void,
    activeCls: (v: string) => string,
  ) => (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-sm font-semibold transition ${
            value === o.value ? activeCls(o.value) : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
          }`}
        >
          <i className={`fa-solid ${o.icon}`} />
          {o.label}
        </button>
      ))}
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleAddSale} className="space-y-5">
      {/* Покупатель */}
      <section className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-200/70 space-y-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-school-blue/10 text-school-blue flex items-center justify-center">
            <i className="fa-solid fa-building" />
          </span>
          <h2 className="text-lg font-bold text-slate-900">Покупатель</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Организация / БИН</label>
            <input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} type="text" placeholder="ТОО / ИП / Школа" className={inputCls} />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Дата отгрузки</label>
            <input required value={saleDate} onChange={(e) => setSaleDate(e.target.value)} type="date" className={inputCls} />
          </div>
        </div>
      </section>

      {/* Позиции */}
      <section className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-200/70 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <i className="fa-solid fa-boxes-stacked" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Проданные позиции</h2>
            <p className="text-xs text-slate-400">Укажите цены — итог посчитается сам</p>
          </div>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex flex-col xl:flex-row gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex gap-3 flex-1 min-w-0">
              <span className="shrink-0 w-8 h-12 flex items-center justify-center text-sm font-bold text-slate-400">{index + 1}</span>
              <input required value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} type="text" placeholder="Название товара" className={`${inputCls} min-w-0`} />
            </div>

            <div className="flex gap-2 w-full xl:w-auto pl-11 xl:pl-0">
              <div className="relative w-full xl:w-36">
                <input value={item.price} onChange={(e) => handleItemChange(index, "price", e.target.value)} type="number" min="0" placeholder="Цена (опц.)" className={`${inputCls} pr-8 min-w-0`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">₸</span>
              </div>

              <div className="relative w-24 shrink-0">
                <input required value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} type="number" min="1" placeholder="Шт." className={`${inputCls} text-center pr-8 min-w-0`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">шт</span>
              </div>

              {items.length > 1 && (
                <button type="button" onClick={() => handleRemoveItem(index)} aria-label="Убрать позицию" className="shrink-0 w-12 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                  <i className="fa-solid fa-trash-can" />
                </button>
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={handleAddItem} className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-sm font-semibold text-school-blue hover:border-school-blue/40 hover:bg-school-blue/5 transition">
          <i className="fa-solid fa-plus mr-2" />
          Добавить позицию
        </button>
      </section>

      {/* Оплата */}
      <section className="bg-white p-5 md:p-7 rounded-3xl shadow-sm border border-slate-200/70 space-y-5">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <i className="fa-solid fa-wallet" />
          </span>
          <h2 className="text-lg font-bold text-slate-900">Оплата</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Способ оплаты</label>
            {segmented(PAYMENT_OPTIONS, paymentMethod, setPaymentMethod, () => "bg-school-blue/10 border-school-blue/40 text-school-blue")}
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Статус</label>
            {segmented(
              Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label, icon: m.icon })),
              status,
              setStatus,
              (v) => STATUS_META[v].chip,
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 ${status === "partial" ? "sm:grid-cols-2" : ""} gap-5`}>
          <div className="flex flex-col gap-2">
            <label className={labelCls}>Итого</label>
            <div className="relative">
              <input required value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" className={`${inputCls} text-2xl font-black py-4 pr-10`} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-bold pointer-events-none">₸</span>
            </div>
          </div>

          {status === "partial" && (
            <div className="flex flex-col gap-2">
              <label className={`${labelCls} !text-amber-600`}>Внесли</label>
              <div className="relative">
                <input required value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} type="number" placeholder="0" className="w-full px-4 py-4 pr-10 text-2xl font-black text-amber-800 border border-amber-200 bg-amber-50 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 text-lg font-bold pointer-events-none">₸</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button disabled={isLoading} type="submit" className="w-full md:w-auto px-10 py-4 text-base font-bold bg-brand-500 text-white rounded-2xl shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          <i className={`fa-solid ${isLoading ? "fa-spinner fa-spin" : "fa-floppy-disk"}`} />
          {isLoading ? "Сохранение..." : "Сохранить заказ"}
        </button>
      </div>
    </form>
  );

  const renderDataAndCharts = () => (
    <div className="space-y-6">
      {/* Сводка */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-school-blue to-slate-900 text-white p-5 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between text-blue-200 text-xs font-semibold uppercase tracking-wider">
            Общая ожидаемая сумма <i className="fa-solid fa-sack-dollar text-base" />
          </div>
          <p className="text-xl md:text-2xl xl:text-3xl font-black mt-3 whitespace-nowrap">{fmt(totalExpected)}</p>
          <p className="text-xs text-blue-200 mt-1">Сделок: {sales.length}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200/70">
          <div className="flex items-center justify-between gap-2 text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            Получено <i className="fa-solid fa-arrow-trend-up text-base" style={{ color: COLORS[0] }} />
          </div>
          <p className="text-base sm:text-xl md:text-2xl font-black mt-3 whitespace-nowrap" style={{ color: COLORS[0] }}>{fmt(totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-1">{paidPercentage.toFixed(0)}% от общей суммы</p>
        </div>
        <button
          type="button"
          onClick={() => setShowDebtors((v) => !v)}
          aria-expanded={showDebtors}
          aria-controls="debtors-panel"
          className={`text-left bg-white p-4 sm:p-5 rounded-3xl shadow-sm border transition hover:shadow-md ${showDebtors ? "border-rose-300 ring-4 ring-rose-100" : "border-slate-200/70 hover:border-rose-200"}`}
        >
          <div className="flex items-center justify-between gap-2 text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            Долг <i className="fa-solid fa-triangle-exclamation text-base" style={{ color: COLORS[1] }} />
          </div>
          <p className="text-base sm:text-xl md:text-2xl font-black mt-3 whitespace-nowrap" style={{ color: COLORS[1] }}>{fmt(totalDebt)}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-center justify-between gap-2">
            <span>{debtPercentage.toFixed(0)}% от общей суммы</span>
            <span className="font-semibold text-rose-500 whitespace-nowrap">
              {debtors.length} <i className={`fa-solid fa-chevron-down text-[10px] ml-0.5 transition-transform ${showDebtors ? "rotate-180" : ""}`} />
            </span>
          </p>
        </button>
      </div>

      {/* Должники — раскрываются по клику на карточку «Долг» */}
      {showDebtors && (
        <div id="debtors-panel" className="bg-white rounded-3xl shadow-sm border border-rose-200 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900">Должники</h3>
              <p className="text-xs text-slate-400">От большего долга к меньшему · нажмите, чтобы открыть сделки</p>
            </div>
            <button type="button" onClick={() => setShowDebtors(false)} aria-label="Свернуть" className="w-9 h-9 shrink-0 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {debtors.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              <i className="fa-solid fa-face-smile text-2xl text-emerald-400 block mb-2" />
              Должников нет
            </p>
          ) : (
            <ol className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {debtors.map((d, i) => (
                <li key={d.name}>
                  <button type="button" onClick={() => showDebtorSales(d.name)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-rose-50/50 transition">
                    <span className="w-6 shrink-0 text-xs font-bold text-slate-300 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">{d.name}</p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(d.debt / debtors[0].debt) * 100}%`, backgroundColor: COLORS[1] }} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {d.deals} {d.deals % 10 === 1 && d.deals % 100 !== 11 ? "сделка" : [2, 3, 4].includes(d.deals % 10) && ![12, 13, 14].includes(d.deals % 100) ? "сделки" : "сделок"} · с {new Date(d.since).toLocaleDateString("ru-RU")}
                      </p>
                    </div>
                    <span className="shrink-0 font-black text-sm sm:text-base text-rose-600 whitespace-nowrap">{fmt(d.debt)}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Диаграмма */}
      <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200/70 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-center">
        <div className="relative h-52 w-full">
          {!isMounted ? null : hasData ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mainChartData} innerRadius={62} outerRadius={88} paddingAngle={3} cornerRadius={6} stroke="none" dataKey="value">
                    {mainChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={customTooltipFormatter} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.15)" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900">{paidPercentage.toFixed(0)}%</span>
                <span className="text-[11px] text-slate-400">получено</span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
              <i className="fa-solid fa-chart-pie text-4xl" />
              <span className="text-sm text-slate-400">Нет данных</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="w-full h-3 rounded-full flex overflow-hidden bg-slate-100">
            <div style={{ width: `${paidPercentage}%`, backgroundColor: COLORS[0] }} className="h-full transition-all duration-500" />
            <div style={{ width: `${debtPercentage}%`, backgroundColor: COLORS[1] }} className="h-full transition-all duration-500" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[0] }} />
              <div>
                <p className="text-slate-400 text-xs">Получено</p>
                <p className="font-bold text-slate-800">{fmt(totalRevenue)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[1] }} />
              <div>
                <p className="text-slate-400 text-xs">К получению (Долг)</p>
                <p className="font-bold text-slate-800">{fmt(totalDebt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div id="sales-list" className="scroll-mt-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" placeholder="Поиск компании..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-2xl focus:border-school-blue focus:ring-4 focus:ring-school-blue/10 outline-none bg-white transition" />
        </div>
        <div className="flex gap-3">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex-1 sm:flex-none px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200 rounded-2xl outline-none bg-white cursor-pointer focus:border-school-blue">
            <option value="all">Все статусы</option>
            <option value="debtors">Только должники</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 sm:flex-none px-4 py-3 text-sm font-medium text-slate-700 border border-slate-200 rounded-2xl outline-none bg-white cursor-pointer focus:border-school-blue">
            <option value="date_desc">Новые</option>
            <option value="amount_desc">Сумма</option>
          </select>
        </div>
      </div>

      {/* Сделки */}
      <div className="space-y-4">
        {processedSales.length === 0 && (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
            <i className="fa-regular fa-folder-open text-4xl mb-3 block text-slate-300" />
            <p className="text-sm">{sales.length === 0 ? "Пока нет ни одной сделки" : "Ничего не найдено"}</p>
          </div>
        )}

        {processedSales.map((sale) => {
          const debt = Number(sale.amount) - Number(sale.paid_amount);
          const meta = STATUS_META[sale.status] ?? STATUS_META.paid;

          const createdStr = sale.created_at ? new Date(sale.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '';
          const updatedStr = sale.updated_at ? new Date(sale.updated_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' }) : '';

          return (
            <div key={sale.id} className="relative bg-white rounded-3xl shadow-sm border border-slate-200/70 overflow-hidden hover:shadow-md transition-shadow">
              <span className={`absolute left-0 inset-y-0 w-1.5 ${meta.stripe}`} />
              <div className="p-5 pl-6 flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="shrink-0 w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 font-black flex items-center justify-center uppercase">
                      {sale.company_name.trim().charAt(0) || "?"}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug break-words">{sale.company_name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          <i className="fa-regular fa-calendar text-[10px]" />
                          {new Date(sale.sale_date).toLocaleDateString('ru-RU')}
                        </span>

                        {/* ИНТЕРАКТИВНЫЙ БЕЙДЖ С ВЫБОРОМ СПОСОБА ОПЛАТЫ */}
                        <select
                          value={sale.payment_method || 'invoice'}
                          onChange={(e) => handlePaymentMethodChange(sale.id, e.target.value)}
                          className={`text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md outline-none cursor-pointer border-none
                            ${sale.payment_method === 'cash' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                          `}
                        >
                          <option value="invoice">ПО СЧЁТУ</option>
                          <option value="cash">НАЛИЧНЫЕ</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-lg text-slate-900 whitespace-nowrap">{fmt(sale.amount)}</div>
                    {sale.status !== 'paid' && (
                      <div className="inline-block text-xs font-semibold mt-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 whitespace-nowrap">Долг: {fmt(debt)}</div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-slate-600 bg-slate-50 rounded-2xl divide-y divide-slate-100">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between gap-3 px-4 py-2.5 items-center">
                      <span className="font-medium text-slate-700 min-w-0 break-words">{item.name}</span>
                      <div className="flex gap-3 text-slate-400 text-xs whitespace-nowrap">
                        {item.price && <span>{Number(item.price).toLocaleString("ru-RU")} ₸</span>}
                        <span className="font-semibold text-slate-500">× {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-col text-[11px] text-slate-400 gap-0.5">
                    {createdStr && <span><i className="fa-regular fa-clock mr-1" />Добавлен: {createdStr}</span>}
                    {updatedStr && updatedStr !== createdStr && <span><i className="fa-solid fa-pen mr-1" />Изменен: {updatedStr}</span>}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select value={sale.status} onChange={(e) => handleStatusChange(sale.id, e.target.value, sale.amount, sale.paid_amount)}
                      className={`text-sm py-2 px-3 rounded-xl border outline-none cursor-pointer font-semibold flex-1 sm:flex-none ${meta.chip}`}>
                      <option value="paid">Оплачено</option>
                      <option value="partial">Частично</option>
                      <option value="debt">В долг</option>
                    </select>
                    <button onClick={() => handleDelete(sale.id)} aria-label="Удалить" title="Удалить" className="w-10 h-10 shrink-0 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                      <i className="fa-solid fa-trash-can" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28 lg:pb-8 flex">
      {/* Боковое меню (компьютер) */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-200 fixed h-full left-0 top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-11 h-11 bg-school-blue rounded-xl flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-graduation-cap text-lg" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 uppercase leading-tight">Mektep Mebel</h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">CRM · учёт продаж</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1.5">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-school-blue text-white shadow-md shadow-school-blue/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
              <i className={`fa-solid ${tab.icon} w-5 text-center`} /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4">
          <Link href="/" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors">
            <i className="fa-solid fa-arrow-up-right-from-square text-xs" /> На сайт
          </Link>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* Шапка (телефон) */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-school-blue rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <span className="text-base font-black text-slate-900 uppercase">CRM</span>
          </div>
          <Link href="/" className="text-sm text-school-blue font-semibold flex items-center gap-1.5">
            На сайт <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">{currentTab.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{currentTab.subtitle}</p>
        </div>

        {activeTab === 'form' && renderForm()}
        {activeTab === 'data' && renderDataAndCharts()}
        {/* вкладка остаётся в DOM, чтобы набранное КП не терялось при переключении */}
        <div hidden={activeTab !== 'offer'}>
          <OfferBuilder />
        </div>
      </main>

      {/* Нижнее меню (телефон) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around z-50 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 px-4 py-1.5 min-w-[84px] rounded-2xl transition-colors ${activeTab === tab.id ? 'text-school-blue bg-school-blue/10' : 'text-slate-400'}`}>
            <i className={`fa-solid ${tab.icon} text-lg`} />
            <span className="text-[11px] font-semibold">{tab.short}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}


//update 4 

