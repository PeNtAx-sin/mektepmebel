import CalculatorModal from "@/components/CalculatorModal";
import { CartProvider } from "@/components/cart/CartProvider";
import CartModal from "@/components/cart/CartModal";
import TenderModal from "@/components/cart/TenderModal";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-brand-500 selection:text-white">
        <TopBar />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CalculatorModal />
      </div>
      <CartModal />
      <TenderModal />
    </CartProvider>
  );
}