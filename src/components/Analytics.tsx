import Script from "next/script";

// Номера счётчиков задаются в .env.local (и в переменных хостинга):
//   NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678
//   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
// Пусто — счётчик не подключается. В режиме разработки не подключаются никогда.
const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      {metrikaId && (
        <>
          <Script id="yandex-metrika" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(${Number(metrikaId)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
          </Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element -- пиксель Метрики для браузеров без JS */}
              <img
                src={`https://mc.yandex.ru/watch/${Number(metrikaId)}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}

      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config',${JSON.stringify(gaId)});`}
          </Script>
        </>
      )}
    </>
  );
}
