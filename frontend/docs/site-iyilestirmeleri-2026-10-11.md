# Site iyileştirmeleri — 11 Ekim 2026

İnceleme raporundaki uygulanabilir değişiklikler tamamlandı. Yayın veya uzak sunucuya gönderim yapılmadı.

## Uygulananlar

- Detay afişleri kendi oranlarında görünür; başlıklar mobilde daha ölçülü. Durum ve tarih ayrıldı, yayın kaydı ve ilgili etkinlik bağlantıları eklendi. Yörünge Muhafızı detayında doğrulanmış proje ekibi ve topluluk standı fotoğrafı bulunuyor.
- Katılım sayfasında üniversite kaydı ve core team başvurusu ayrı eylemler. Öğrenci hesabıyla giriş gereksinimi açık; kısa sorular ve iletişim adresi mevcut.
- Arşivde tarihliler yeni önce sıralanır. Cloud Night yıl bilgisi tamamlandı, afiş verileri ortak içerik dosyasına taşındı. Filtre temizleme, boş durum ve eylem açıklamaları eklendi.
- Mobilde hero ve kapanışın uzun kaydırma sahneleri kaldırıldı; masaüstündeki etkinlik kartlarının sıralı kaydırma düzeni korundu. Gereksiz küçük sloganlar azaltıldı.
- İç sayfalarda yerel kaydırma kullanılır. Üst menü sabit ve mobil aktif sayfa belirgin; yukarı dön bağlantısı footer görünürken gizlenir.
- Medium tarihleri ve yayıncı hesabı RSS'den doğrulandı; okuma süreleri yaklaşık olarak gösterilir. En yeni yazı öne çıkar, büyük kapak 960 px kaynak kullanır; görsel yüklenemezse yedek görünüm devreye girer.
- Topluluk fotoğrafları ekran boyutuna uygun WebP kaynaklarıyla sunulur. Paylaşım görseli, sayfaya özel açıklamalar, OG/Twitter meta verileri, sitemap ve robots tamamlandı.
- Ekip yapısı dört komiteye genişletildi. Gerçek core team listesi yerine kullanıcının istediği örnek isimler, harfli portreler ve görünür örnek içerik açıklaması korunur.
- 404 sayfasına etkinliklere dönüş eylemi eklendi.

## İçerik güncelleme

`npm run content:refresh`: Medium RSS'den 10 yazının başlık, URL, kapak, yayın tarihi ve yaklaşık okuma süresini `content-drafts/medium.json` dosyasına yazar. Yayınlanan içeriği değiştirmez. Kontrol edilen yazılar `src/content/data.ts` üzerinden eklenir.

`node docs/prepare-site-assets.mjs`: topluluk fotoğraf varyantlarını ve sosyal paylaşım kartını yeniden üretir.

## İçerik bekleyenler

- Gerçek core team isimleri, görev dönemi, komite dağılımı ve portreler.
- Teknoloji Zirvesi, Vision Fest II ve İNÜFEST'in kesin tarihi ve mekân ayrıntıları. Ankara kaynaklarında 3/4 Aralık başlangıç çelişkisi var; kesin tarih tahmin edilmedi.
- Topluluk metinlerinin yönetim onayı ve kuruluş yılı.
- Yayın alan adı: canonical, sosyal görsel ve sitemap mevcut `site.origin` değerini kullanır; farklı alan adına yayınlanacaksa tek yerden güncellenmeli.
- Yeni etkinlikler için doğrulanmış duyurular, kayıtlar ve gerçek galeriler. Mevcut içerik sayısında arama paneli ve CMS eklenmedi; içerik büyüdüğünde değerlendirilir.

## Doğrulama

Astro check, üretim derlemesi ve üretilmiş sayfa/bağlantı/içerik/SEO testleri. Tarayıcıda dar mobil taşma, filtrelerin boş durumu ve temizleme, mobil menü ve Escape, afiş oranları, yazı kapakları, masaüstü görünümü kontrol edildi. Lighthouse puanı veya kapsamlı erişilebilirlik sertifikasyonu yapılmadı.
