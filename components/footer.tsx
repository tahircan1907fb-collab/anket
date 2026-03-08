import Link from "next/link";

export function Footer() {
     return (
          <footer className="site-footer">
               <div className="container footer-inner">
                    <div className="footer-brand">
                         <span className="navbar-logo" aria-hidden="true">◇</span>
                         <span className="navbar-name">AmbarScope</span>
                         <p className="muted">Premium ambar ihtiyaç analizi platformu.</p>
                    </div>
                    <div className="footer-links">
                         <div className="footer-col">
                              <strong>Platform</strong>
                              <a href="#anket">İhtiyaç Analizi</a>
                              <Link href="/admin">Admin Paneli</Link>
                         </div>
                         <div className="footer-col">
                              <strong>Destek</strong>
                              <a href="mailto:info@ambarscope.com">İletişim</a>
                         </div>
                    </div>
               </div>
               <div className="footer-bottom container">
                    <span className="muted">© {new Date().getFullYear()} AmbarScope. Tüm hakları saklıdır.</span>
               </div>
          </footer>
     );
}
