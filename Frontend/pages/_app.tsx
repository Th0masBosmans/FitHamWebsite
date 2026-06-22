import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/organisms/layout/Header";
import { Footer } from "@/components/organisms/layout/Footer";
import { SplashScreen } from "@/components/organisms/layout/SplashScreen";
import { ScrollToTop } from "@/components/organisms/layout/ScrollToTop";
import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("sb=")) return;

    const params = new URLSearchParams(hash.slice(1));
    const type = params.get("type");
    const target = type === "recovery" ? "/admin/update-password" : "/admin/invite";

    if (!router.pathname.startsWith(target)) {
      router.replace(target + hash);
    }
  }, []);
  const isAdminPage = router.pathname.startsWith("/admin");

  if (isAdminPage) {
    return <Component {...pageProps} />;
  }

  return (
    <>
      <SplashScreen />
      <ScrollToTop />
      <div className="min-h-screen w-full overflow-x-hidden relative flex flex-col">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-b from-[var(--color-primary-brand)] to-[#5cd6ff]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url(/assets/background-pattern.png)",
              backgroundSize: "540px",
              backgroundPosition: "center",
              backgroundRepeat: "repeat",
              opacity: 0.11,
            }}
          />
        </div>
        <Header />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </>
  );
}
