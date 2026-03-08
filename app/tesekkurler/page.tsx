import Link from "next/link";

import { ThankYouSummary } from "@/components/thank-you-summary";

export default function ThankYouPage() {
  return (
    <main className="shell thank-you-shell">
      <div className="container thank-you-layout">
        <div className="thank-you-card">
          <span className="eyebrow">Basvuru Alindi</span>
          <h1 className="section-title">Kesif gorusmesi icin on hazirliginiz tamamlandi.</h1>
          <p>
            Yanitlariniz kaydedildi. Premium analiz akisi, sizin icin uygun kapsam etiketlerini ve on oneriyi hazirladi.
            Ekibimiz bu veriyi kullanarak daha hizli ve dogru bir demo gorusmesi planlayabilir.
          </p>
          <div className="thank-you-actions">
            <Link className="button" href="/">
              Yeni analiz baslat
            </Link>
            <Link className="button-secondary" href="/admin">
              Admin paneline git
            </Link>
          </div>
        </div>
        <ThankYouSummary />
      </div>
    </main>
  );
}
