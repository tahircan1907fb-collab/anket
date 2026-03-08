import Link from "next/link";

import { SurveyExperience } from "@/components/survey/survey-experience";

const valueCards = [
  {
    title: "Operasyon netligi",
    text: "Ambar surecinizde hangi modullerin kritik oldugunu sadece toplamayiz; hangi yogunlukta tasarlanmasi gerektigini de ortaya koyariz."
  },
  {
    title: "Premium analiz dili",
    text: "Soru akisi klasik form mantiginda degil; ihtiyacinizi uzman analizci gibi katman katman okuyan bir deneyim olarak kurgulandi."
  },
  {
    title: "Demo icin hazir cikti",
    text: "Anket sonunda cozum etiketi, kapsam seviyesi ve iletisim talebi ayni akis icinde toplanir."
  },
  {
    title: "Gelistirilebilir omur",
    text: "Ilk surum MVP odaklidir; ileride barkod, tedarikci, sevkiyat ve ayrintili panel katmanlari rahatlikla buyur."
  }
];

const features = [
  {
    title: "Surec bazli kosullu akış",
    text: "Barkod secen farkli sorular gorur, cok depolu yapilar transfer ve lokasyon detayina iner."
  },
  {
    title: "Anlik ozet etiketleri",
    text: "Secimleriniz ilerledikce sistem sizin icin kapsam etiketleri uretir."
  },
  {
    title: "Admin izleme paneli",
    text: "Basvurular tek panelde toplanir, durumlari guncellenir ve detay cevaplar goruntulenir."
  }
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Premium Ambar Analizi</span>
            <h1>Ambar ihtiyacinizi netlestiren premium web deneyimi.</h1>
            <p>
              Depo operasyonunuzu sadece stok takibi olarak degil, surec, lokasyon, kullanici ve entegrasyon
              derinligiyle degerlendiren bir analiz akisi kurduk. Ziyaretci, birkac dakika icinde hangi yapinin kendisine
              uygun oldugunu anlayabilir; siz de nitelikli demo taleplerini toparlayabilirsiniz.
            </p>
            <div className="hero-actions">
              <a className="button" href="#anket">
                İhtiyaç analizini başlat
              </a>
              <Link className="button-secondary" href="/admin">
                Admin panelini gör
              </Link>
            </div>
            <div className="metric-grid">
              <div className="metric-card animate-in" style={{ "--delay": "0.1s" } as any}>
                <span className="accent-dot"></span>
                <strong>6 adım</strong>
                <span>Operasyon profili, süreç, stok ve entegrasyon</span>
              </div>
              <div className="metric-card animate-in" style={{ "--delay": "0.2s" } as any}>
                <span className="accent-dot"></span>
                <strong>Koşullu akış</strong>
                <span>Yanıta göre değişen premium form deneyimi</span>
              </div>
              <div className="metric-card animate-in" style={{ "--delay": "0.3s" } as any}>
                <span className="accent-dot"></span>
                <strong>Supabase hazır</strong>
                <span>Gerçek veri kaydı ve yönetim paneli</span>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-diagram">
              <div className="diagram-row">
                <div className="diagram-block glow">
                  <strong>Depo haritası</strong>
                  <span>Lokasyon derinliği</span>
                </div>
                <div className="diagram-block">
                  <strong>İş akışları</strong>
                  <span>Giriş, çıkış, iade</span>
                </div>
                <div className="diagram-block">
                  <strong>Takım yetkisi</strong>
                  <span>Rol bazlı yönetim</span>
                </div>
              </div>
              <div className="diagram-row">
                <div className="diagram-block">
                  <strong>Veri bağlantısı</strong>
                  <span>ERP & Muhasebe</span>
                </div>
                <div className="diagram-block glow">
                  <strong>Canlı özet</strong>
                  <span>Kapsam etiketleri</span>
                </div>
                <div className="diagram-block">
                  <strong>Demo CTA</strong>
                  <span>Nitelikli başvuru</span>
                </div>
              </div>
            </div>
            <span className="muted">
              Endustriyel premium ton, raf hissi veren grid katmanlari ve akici step mimarisi ile tasarlandi.
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container value-grid">
          {valueCards.map((item) => (
            <div className="value-card" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Calisma Mantigi</span>
          <h2 className="section-title">Depo yazilimi kapsamını once anlamla, sonra tekliflendir.</h2>
          <p className="muted">
            Bu deneyim; kullanicinin sadece bir form doldurmasini degil, ihtiyacinin kapsamını dogru seviyede ifade etmesini
            saglar. Sonuc olarak daha temiz bir analiz ozetine, daha net demo gorusmesine ve daha guclu bir premium algiya
            sahip olursunuz.
          </p>
          <div className="feature-grid">
            {features.map((feature) => (
              <div className="feature-item" key={feature.title}>
                <strong>{feature.title}</strong>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SurveyExperience />
    </main>
  );
}
