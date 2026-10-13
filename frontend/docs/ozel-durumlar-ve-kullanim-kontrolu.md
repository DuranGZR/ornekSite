# Özel durumlar ve kullanım kontrolü

11 Ekim 2026

## Değişiklikler

- 404'teki kesik yol motifi, filtre boş durumu ve görsel yedeğinde ortak bir SVG olarak kullanılır.
- Filtre eşleşmesi yoksa açıklayıcı metin ve filtreleri temizleme eylemi gösterilir.
- Yaklaşan etkinlik yoksa ayrı metin ve arşive dönüş eylemi gösterilir. Aynı bilginin iki yerde tekrarı önlenir.
- Ana içerikte yüklenemeyen kapak, afiş ve fotoğraflar için ortak yedek görünüm. Mevcut kutu korunur, boyut değişikliklerinde yedek alan yeniden hesaplanır. Açıklayıcı erişilebilir isim bulunur.
- Ana içerik klavyeyle odaklanabilir. Latin ve Türkçe karakterleri içeren font dosyaları ön yüklenir.

## Tarayıcı kontrolleri

- 320 ve 390 px telefon genişlikleri: yatay taşma yok, filtreler kullanılabilir, boş durum eylemleri sığar.
- Ana sayfada Tab ile içeriğe geç bağlantısına erişim, Enter ile main odağı, kaydırma kontrol edildi.
- Filtre temizlendiğinde tüm öğeler geri gelir ve odak Tümü düğmesine döner.
- Mobil menü Enter ile açılır, Tab ile ilk menü bağlantısına geçilir, Escape ile kapanır ve odak menü düğmesine döner.
- Geçici yerel kontrol sayfasında gerçekten bulunmayan resim dosyalarıyla kapak ve afiş hatası denendi. Yedekler görünür; yan bilgi paneli örtülmez. Geçici kontrol sayfası ve ölçüm betiği teslimden önce kaldırıldı.

## Metin kontrastı

Hesaplama sRGB bağıl parlaklığına dayanır; bütün fotoğraf üstü metinlerin veya tüm etkileşim durumlarının kapsamlı WCAG denetimi değildir.

| Renk çifti                       | Oran    |
| -------------------------------- | ------- |
| Ana metin / sayfa zemini         | 13,94:1 |
| İkincil metin / sayfa zemini     | 4,76:1  |
| İkincil metin / kırık beyaz kart | 5,04:1  |
| Bordo / kırık beyaz kart         | 9,41:1  |
| Beyaz / bordo buton              | 10,25:1 |
| Beyaz / koyu buton               | 16,08:1 |
| Odak çizgisi / sayfa zemini      | 5,55:1  |

## Yerel yükleme ölçümü

Astro üretim derlemesi, localhost 4322, tarayıcıda 390 × 844 görünüm. Ağ veya CPU yavaşlatması uygulanmadı; önbellek temizlenmedi. Geçici PerformanceObserver ile ölçüldü, navigasyon sonrası yaklaşık üç saniyelik gözlem alındı. Son üç sayfa ölçümü:

| Sayfa       | TTFB   | FCP    | LCP    | Gözlem süresindeki kayma toplamı |
| ----------- | ------ | ------ | ------ | -------------------------------- |
| Ana sayfa   | 3,1 ms | 140 ms | 140 ms | 0                                |
| Etkinlikler | 5 ms   | 104 ms | 236 ms | 0                                |
| Yazılar     | 2 ms   | 84 ms  | 84 ms  | 0                                |

Font ön yüklemesi eklenmeden önce ilk ana sayfa geçişinde 0,160 yerleşim kayması görüldü; sonraki önbellekli geçişlerde sıfırdı. Son sıfır sonuçlar soğuk önbellek veya gerçek cihaz doğrulaması sayılmaz. Bu rakamlar yerel geliştirme bilgisayarındaki ölçümlerdir; mobil internet performansı, Lighthouse puanı veya saha Core Web Vitals sonucu değildir. Kayma toplamı standart CLS oturum penceresi algoritmasıyla hesaplanmadı.

## Fiziksel cihazda kalan kontrol

Gerçek telefona erişim olmadığından cihaz üzerinde ölçüm yapılmadı. iOS Safari ve Android Chrome'da ilk açılış, geri dönüş, adres çubuğu değişirken kaydırma, dokunma alanları ve gerçek mobil ağda yükleme ayrıca kontrol edilmeli.
