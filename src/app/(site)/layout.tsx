import CalculatorModal from "@/components/CalculatorModal";
import { CartProvider } from "@/components/cart/CartProvider";
import CartModal from "@/components/cart/CartModal";
import TenderModal from "@/components/cart/TenderModal";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";
import { getCatalogMenu } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const catalogMenu = await getCatalogMenu();

  return (
    <CartProvider>
      <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-brand-500 selection:text-white">
        <TopBar />
        <Header catalogMenu={catalogMenu} />
        <main className="flex-grow">{children}</main>
        <Footer catalogMenu={catalogMenu} />
        <CalculatorModal />
      </div>
      <CartModal />
      <TenderModal />
    </CartProvider>
  );
}