import Analytics from "@/components/Analytics";
import CalculatorModal from "@/components/CalculatorModal";
import { CartProvider } from "@/components/cart/CartProvider";
import CartModal from "@/components/cart/CartModal";
import TenderModal from "@/components/cart/TenderModal";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";
import JsonLd from "@/components/JsonLd";
import { getArticles, getCatalogMenu } from "@/lib/data";
import { siteSchemas } from "@/lib/schema";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [catalogMenu, articles] = await Promise.all([getCatalogMenu(), getArticles()]);
  const showBlog = articles.length > 0;

  return (
    <CartProvider>
      <div className="bg-slate-50 text-slate-800 font-sans antialiased min-h-screen flex flex-col selection:bg-brand-500 selection:text-white">
        <TopBar />
        <Header catalogMenu={catalogMenu} showBlog={showBlog} />
        <main className="flex-grow">{children}</main>
        <Footer catalogMenu={catalogMenu} showBlog={showBlog} />
        <CalculatorModal />
      </div>
      <CartModal />
      <TenderModal />
      <JsonLd data={siteSchemas()} />
      <Analytics />
    </CartProvider>
  );
}