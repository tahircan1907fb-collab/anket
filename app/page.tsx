import Link from "next/link";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ScrollToTop } from "@/components/scroll-to-top";
import { SurveyExperience } from "@/components/survey/survey-experience";

const valueCards = [
  {
    title: "Operasyon netliği",
    text: "Ambar sürecinizde hangi modüllerin kritik olduğunu sadece toplamayız; hangi yoğunlukta tasarlanması gerektiğini de ortaya koyarız."
  },
  {
    title: "Premium analiz dili",
    text: "Soru akışı klasik form mantığında değil; ihtiyacınızı uzman analizci gibi katman katman okuyan bir deneyim olarak kurgulandı."
  },
  {
    title: "Demo için hazır çıktı",
    text: "Anket sonunda çözüm etiketi, kapsam seviyesi ve iletişim talebi aynı akış içinde toplanır."
  },
  {
    title: "Geliştirilebilir ömür",
    text: "İlk sürüm MVP odaklıdır; ileride barkod, tedarikçi, sevkiyat ve ayrıntılı panel katmanları rahatlıkla büyür."
  }
];

const features = [
  {
    title: "Süreç bazlı koşullu akış",
    text: "Barkod seçen farklı sorular görür, çok depolu yapılar transfer ve lokasyon detayına iner."
  },
  {
    title: "Anlık özet etiketleri",
    text: "Seçimleriniz ilerledikçe sistem sizin için kapsam etiketleri üretir."
  },
  {
    title: "Admin izleme paneli",
    text: "Başvurular tek panelde toplanır, durumları güncellenir ve detay cevaplar görüntülenir."
  }
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="shell">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Premium Ambar Analizi</span>
              <h1>Ambar ihtiyacınızı netleştiren premium web deneyimi.</h1>
              <p>
                Depo operasyonunuzu sadece stok takibi olarak değil, süreç, lokasyon, kullanıcı ve entegrasyon
                derinliğiyle değerlendiren bir analiz akışı kurduk. Ziyaretçi, birkaç dakika içinde hangi yapının kendisine
                uygun olduğunu anlayabilir; siz de nitelikli demo taleplerini toparlayabilirsiniz.
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
                    <span>ERP &amp; Muhasebe</span>
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
                Endüstriyel premium ton, raf hissi veren grid katmanları ve akıcı step mimarisi ile tasarlandı.
              </span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container value-grid">
            {valueCards.map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 100}>
                <div className="value-card">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="container">
            <ScrollReveal>
              <span className="eyebrow">Çalışma Mantığı</span>
              <h2 className="section-title">Depo yazılımı kapsamını önce anlamla, sonra tekliflendir.</h2>
              <p className="muted">
                Bu deneyim; kullanıcının sadece bir form doldurmasını değil, ihtiyacının kapsamını doğru seviyede ifade etmesini
                sağlar. Sonuç olarak daha temiz bir analiz özetine, daha net demo görüşmesine ve daha güçlü bir premium algıya
                sahip olursunuz.
              </p>
            </ScrollReveal>
            <div className="feature-grid">
              {features.map((feature, index) => (
                <ScrollReveal key={feature.title} delay={index * 120}>
                  <div className="feature-item">
                    <strong>{feature.title}</strong>
                    <span>{feature.text}</span>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <SurveyExperience />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
