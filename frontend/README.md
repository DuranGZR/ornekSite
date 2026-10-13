# HSD İnönü frontend

Statik Astro + TypeScript sitesi. SVG mühendislik çizimini, GSAP kaydırmaya bağlı sahne geçişlerini yönetir. Üye girişi, sunucu ve veri tabanı yoktur.

## Çalıştırma

Node.js 22 ile `frontend` klasöründe:

```sh
npm install
npm run dev
npm run check
npm run build
```

## Düzen

- `src/pages`: rota ve bölüm bileşimi.
- `src/layouts/Base.astro`: ortak navigasyon, SEO, alt bilgi.
- `src/components`: paylaşılan arayüzler ve açılış.
- `src/content/data.ts`: doğrulanmış faaliyetler, proje ekibi, yazar katkıları ve Medium yazıları.
- `src/config/site.ts`: sosyal hesaplar, site adresi ve dış başvuru URL'si.
- `src/scripts/site-motion.ts`: ortak akıcı kaydırma, bölüm geçişleri, ilerleme ve yukarı dönüş.
- `src/scripts/home-motion.ts`: ana sayfanın GSAP kaydırma sahneleri.
- `src/styles/global.css`: katmanlı tasarım sistemi ve ekran uyarlamaları.

## İçerik güncelleme

1. Doğrulanmış güncel başvuru formu varsa `site.applicationUrl` alanına ekleyin. Boşken Instagram profilindeki resmi Linktree bağlantısı gösterilir.
2. Etkinliklerin kaynakları `docs/community-content-sources.md` içinde kayıtlıdır. Yerel arşiv görselleri `public/community` içindedir. Paylaşım tarihini etkinlik tarihi yerine kullanmayın; kesin tarih bilinmiyorsa `date` alanını boş bırakın. Tamamlanmış faaliyetler `status: 'completed'` ile işaretlenir.
3. Medium kartları gerçek kapakları ve doğrudan makale bağlantılarını kullanır. Proje ekibi ve yazar katkıları dönem yönetim listesi değildir.
4. `public/hsd-logo.svg`, topluluk logosuna dayanan şeffaf vektör uyarlamasıdır. Resmî marka dosyası sağlandığında bu dosyayı değiştirin; kaynak bilgisi `docs/motion-design.md` içindedir.
5. Yeni duyurular doğrulanınca eklenir. Statik içerik güncellemeleri yeniden derleme/yayın ister; dönem filtresi tamamlanma durumunu ve tarayıcı saatini kullanır.

## Erişilebilirlik / performans

Lenis ile akıcı fare kaydırması, doğal dokunmatik kaydırma, klavye menüsü, Escape ile kapanma, görünür odak ve filtre sonuç anonsu. Reduced-motion kaydırma yumuşatmasını ve sahne animasyonlarını kapatır. SVG logo her çözünürlükte keskindir. JavaScript olmadan içerik ve bağlantılar kullanılabilir. Fiziksel mobil cihaz testi ayrıca gerekir.

## Yayın

`dist` dizini statik çıktıdır. `.openai/hosting.json` yerel Sites bağlantısını korur ve Git dışında tutulur. Gizli bilgileri kaynak koduna eklemeyin.
