# HSD İnönü frontend

Statik Astro + TypeScript sitesi. Three.js dekoratif açılış sahnesini, GSAP tek seferlik sahne girişini yönetir. Üye girişi, sunucu ve veri tabanı yoktur.

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
- `src/content/data.ts`: tipli örnek etkinlikler, ekip ve yazılar.
- `src/config/site.ts`: sosyal hesaplar, site adresi ve dış başvuru URL'si.
- `src/scripts/sculpture.ts`: WebGL yaşam döngüsü, mobil kalite ve hareket kontrolü.
- `src/styles/global.css`: katmanlı tasarım sistemi ve ekran uyarlamaları.

## Gerçek içeriğe geçiş

1. `site.applicationUrl` alanına form adresini yazın. Boşken Instagram iletişimi gösterilir.
2. `data.ts` içindeki örnek isimleri, ISO tarihlerini ve açıklamaları değiştirin. Fotoğraflar Unsplash kaynaklı temsili uzak görsellerdir; gerçek fotoğrafları `public/images` veya optimize etmek için `src/assets` içine taşıyın.
3. Medium bağlantıları şu an profil adresine gider; makalelerin kalıcı adreslerini ekleyin.
4. Gerçek logo sağlandığında Base.astro içindeki metin yer tutucusunu değiştirin.
5. Demo açıklamalarını yalnızca gerçek içerikler doğrulandıktan sonra kaldırın. Tarihli statik içerik güncellemeleri yeniden derleme/yayın ister; dönem filtresi tarayıcı saatine göre çalışır.

## Erişilebilirlik / performans

Doğal kaydırma, klavye menüsü, Escape ile kapanma, görünür odak, filtre sonuç anonsu, hareket durdurma kontrolü. Reduced-motion başlangıçta sahneyi sabitler. WebGL yoksa CSS yedeği gösterilir. Sahne görünüm dışında veya sekme gizliyken durur; mobil piksel oranı 1.35 ile sınırlıdır. Fiziksel mobil cihaz testi ayrıca gerekir.

## Yayın

`dist` dizini statik çıktıdır. `.openai/hosting.json` Sites kimliğini korur. Gizli bilgileri kaynak koduna eklemeyin.
