import Link from "next/link";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThankYouSummary } from "@/components/thank-you-summary";

export default function ThankYouPage() {
  return (
    <>
      <Navbar />
      <main className="shell thank-you-shell">
        <div className="container thank-you-layout" style={{ position: "relative" }}>
          <div className="confetti-wrap" />
          <div className="thank-you-card">
            <div className="success-icon" />
            <span className="eyebrow">Başvuru Alındı</span>
            <h1 className="section-title">Keşif görüşmesi için ön hazırlığınız tamamlandı.</h1>
            <p>
              Yanıtlarınız kaydedildi. Premium analiz akışı, sizin için uygun kapsam etiketlerini ve ön öneriyi hazırladı.
              Ekibimiz bu veriyi kullanarak daha hızlı ve doğru bir demo görüşmesi planlayabilir.
            </p>
            <div className="thank-you-actions">
              <Link className="button" href="/">
                Yeni analiz başlat
              </Link>
              <Link className="button-secondary" href="/admin">
                Admin paneline git
              </Link>
            </div>
          </div>
          <ThankYouSummary />
        </div>
      </main>
      <Footer />
    </>
  );
}
