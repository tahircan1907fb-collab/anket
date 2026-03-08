# Premium Ambar Ihtiyac Analizi

Bu repo, `Next.js App Router + Supabase` ile hazirlanmis tek sayfa premium ambar ihtiyac analizi deneyimini icerir.

## Kurulum

1. `.env.example` dosyasindaki alanlari `.env.local` icine kopyalayin.
2. Supabase projenizde `supabase/schema.sql` dosyasini calistirin.
3. Bagimliliklari yukleyin:
   `C:\Program Files\nodejs\npm.cmd install`
4. Gelistirme sunucusunu baslatin:
   `C:\Program Files\nodejs\npm.cmd run dev`

## Route'lar

- `/`: Landing + premium kosullu anket
- `/tesekkurler`: Ozet ve sonraki adim ekrani
- `/admin`: Basvuru listesi ve filtreleme
- `/admin/login`: Supabase auth ile admin girisi
- `/admin/submissions/[id]`: Basvuru detaylari

## Notlar

- Supabase ortam degiskenleri yoksa site demo verisiyle yine acilir.
- Gercek admin auth ve kalici veri icin Supabase baglantisi gereklidir.
- Anket sorulari `lib/survey/config.ts` icindeki TypeScript yapisindan yonetilir.
