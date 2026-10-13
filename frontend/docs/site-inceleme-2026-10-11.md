# HSD İnönü — Site inceleme raporu

11 Ekim 2026

## Genel değerlendirme

Site güçlü bir görsel temele sahip: bordo vurgu, açık zemin, gerçek topluluk fotoğrafları ve tutarlı tipografi kimliği anlaşılır kılıyor. Ana sayfanın kaydırmalı etkinlik sunumu karakterli; iç sayfaların daha sakin olması da doğru bir ayrım.

Bir sonraki aşamada en büyük kazanım yeni dekorasyonlardan değil; görsellerin doğru sunulmasından, içeriklerin tamamlanmasından ve ziyaretçinin yapmak istediği işe daha kısa yoldan ulaşmasından gelecek. Tasarımın bazı bölgelerinde büyük başlıklar ve geniş boşluklar, az miktardaki bilgiyi gereğinden fazla uzatıyor.

Bu çalışma inceleme ve öneri raporudur. Site kaynaklarında değişiklik yapılmadı.

## İnceleme kapsamı ve sınırlar

- Ana sayfa, Topluluk, Etkinlikler, Yazılar, Ekip, Katılım ve 404 görünümü.
- Beş etkinliğin detay sayfası; toplam 12 sayfa görünümü.
- Masaüstü görünümü, 390 px mobil görünüm; 320 px dar telefon boyutunda ana sayfalar ve uzun bir etkinlik detayı; 900 px tablet boyutunda ana sayfa, etkinlik arşivi ve ekip.
- Etkinlik dönem filtresinin boş durumu, mobil menünün açılması ve Escape ile kapanması, ana sayfa etkinlik bağlantısı.
- İçerik verileri, ortak düzen, stil dosyaları, hareket kodu, paylaşım meta verileri ve mevcut testlerin kapsamı.

Sosyal hesaplar bu incelemede yeniden doğrulanmadı. Etkinliklerin eksik tarihleri için kaynak araştırması ayrıca gerekir. Gerçek cihaz performans ölçümü, Lighthouse puanı, ekran okuyucu oturumu ve tüm klavye akışlarının kapsamlı testi yapılmadı. Performans önerileri kod ve dosya boyutlarına dayanıyor.

## Öncelik tablosu

| Öncelik | Bulgular | Önerilen değişiklik | Beklenen fayda |
| --- | --- | --- | --- |
| 1 | Etkinlik detaylarında dikey afişler yatay alana kırpılıyor. | Afişleri kendi oranlarında, tamamı görünür şekilde sunmak; fotoğraflara ayrı görüntüleme kuralı uygulamak. | Tarih, metin ve yüzler kaybolmaz. |
| 1 | Katılım için doğrudan başvuru URL'si tanımlı değil; Linktree kullanılıyor. | Gerçek başvuru bağlantısı geldiğinde ana eylemi ona bağlamak; o zamana kadar başvuru durumunu açıkça belirtmek. | Ziyaretçinin sonraki adımı netleşir. |
| 1 | Beş etkinliğin yalnızca birinde tarih/saat verisi bulunuyor. | Doğrulanabilen tarih, saat ve mekânı tamamlamak; tarih ile tamamlanma durumunu ayrı göstermek. | Arşiv kronolojik ve güvenilir hale gelir. |
| 1 | Ekipte geçici isimler ve harfli portreler var. | Onaylı gerçek liste, portreler ve görev dönemi eklemek. | Tasarım gerçek insanlarla tamamlanır. |
| 2 | Başlık ölçekleri iç sayfalarda farklı; bazı uzun başlıklar çok alan kaplıyor. | Ortak başlık, açıklama ve bölüm aralığı sistemi kurmak. | Sayfalar daha dengeli ve okunaklı olur. |
| 2 | Ana sayfanın mobil akışı uzun; giriş ve kapanışta uzun hareket alanları var. | Mobilde bu alanları kısaltmak; ilk metin ve eylemi daha erken göstermek. | İçeriğe erişim hızlanır. |
| 2 | Paylaşım görseli ve bazı SEO tamamlayıcıları yok. | OG görseli, sayfaya özgü açıklamalar, sitemap ve robots eklemek. | Paylaşımlar ve arama görünümü tamamlanır. |
| 3 | İçerik elle yönetiliyor; yazı sayısı üç. | Önce basit içerik şablonları; içerik arttığında arama, filtre ve otomatik taslak senkronizasyonu. | Güncelleme kolaylaşır; küçük sitede gereksiz arayüz oluşmaz. |

## Ana sayfa

**İyi çalışanlar:** Açılış açıklaması topluluğun üniversitesini ve faaliyetlerini anlatıyor. Ana katılım butonu ve etkinlik bağlantısı açık. Gerçek topluluk fotoğrafı güçlü bir güven unsuru. Mobilde topluluk fotoğrafının yazısı fotoğrafın altında; etkinlik kartları normal akışta.

**İyileştirmeler:**

1. Ana metin ve katılım butonu ilk anda okunabilir olmalı. Giriş animasyonu şu an metni ve eylemleri sırayla getiriyor; bunu daha kısa ve hafif hale getirmek açılışı netleştirir.
2. Mobilde giriş görseli ve kartın büyüdüğü kapanış, içerik için uzun bir kaydırma yolu oluşturuyor. Kontrol edilen mobil görünümde ana sayfa yaklaşık 8.100 px uzunluğundaydı. Bu tek başına hata değildir; fakat uzunluğun önemli bölümünü hareket sahneleri oluşturduğu için kısaltma değerlidir.
3. Etkinlik sunumunda mevcut kart düzenini koruyup durum ve doğrulanmış tarihi netleştirmek. Arşiv faaliyetleri ile yeni duyurular aynı önem düzeyinde sunulmamalı.
4. Bölüm başlıklarının üstündeki numara ve sloganları azaltmak. Bunlar gezinmeye yardımcı olmadığında sadece ek satır oluşturuyor.
5. Yazı satırlarında uzun başlıkların genişliğini ve yazı boyutunu sınırlamak; başlık kırılmalarını masaüstü ve mobilde ayrı düzenlemek.

**Yeni fikir:** Gerçek bir gelecek etkinlik olduğunda kısa bir “Sıradaki buluşma” alanı. Bunun temeli zaten var; yeni bir dekoratif bölüm gerekmiyor. Etkinlik yokken sahte duyuru yerine mevcut açıklık korunmalı.

## Topluluk

**İyi çalışanlar:** Sayfa artık topluluğun kimliği, misyonu, vizyonu ve değerleriyle sınırlı. Proje, etkinlik ve katılım tekrarlarının kalkması anlatımı güçlendirmiş.

**İyileştirmeler:** Misyon ve vizyon metinlerini yönetimin onayladığı ifadelerle kesinleştirmek. İki paragrafın satır uzunluğunu ve bölüm boşluklarını aynı ritme oturtmak. Üst fotoğrafta tavandan ziyade insanları öne çıkaracak kontrollü bir kadraj değerlendirmek.

**Yeni fikir:** Kuruluş yılı ve Huawei Student Developers ağıyla ilişkiyi, bilgiler doğrulandıktan sonra tek bir kısa kimlik cümlesine eklemek. Bu sayfaya yeniden projeler, başarı kartları veya başvuru alanı eklemeye gerek yok.

## Etkinlik arşivi

**İyi çalışanlar:** Kategoriler anlaşılır. Afişler arşiv kartlarında bütünüyle görülebiliyor. Yaklaşan filtresi boş olduğunda açıklayıcı bir durum ve Instagram bağlantısı gösteriliyor.

**İyileştirmeler:**

- Dört etkinlikte tarih verisi yok; “Tamamlandı” tarih alanının yerini alıyor. Durum etiketi, tarih ve konum ayrı bilgi türleri olmalı. Eksik bilgiler tahmin edilmeden tamamlanmalı.
- Cloud Night afişinde arşiv metni “19 Aralık” diyor; yıl bilgisi doğrulanıp eklenmeli.
- Tarihleri bilinen etkinlikler en yeni önce sıralanmalı; tarihsiz içerikler bilinçli bir arşiv düzeninde kalmalı.
- “Afiş arşivi” kartları resim dosyasını açarken diğer kartlar detay sayfasına gidiyor. Eylem metninde “Afişi aç” ve “Etkinliği incele” ayrımı yapılmalı.
- Kategori ve dönem filtreleri birlikte sonuç vermediğinde “Filtreleri temizle” eylemi eklenebilir. Gelecek etkinlik bulunmadığı bilgisini filtreye basmadan göstermek de yardımcı olur.

**Yeni fikir:** İçerik arttığında yıl grupları ve başlık araması. Mevcut yedi arşiv öğesi için kapsamlı bir arama paneli öncelikli değil.

## Beş etkinliğin detay sayfaları

En belirgin görsel sorun burada. Dikey afişler masaüstünde `2 / 1`, mobilde `1.3 / 1` alana `cover` ile yerleştiriliyor. Örneğin Sektörel Sohbetler afişi 480 × 600 iken kontrol edilen masaüstü görünümünde yaklaşık 539 × 269 alanda sunuluyor; afişin üstü ve altı kayboluyor.

![Etkinlik detayındaki kırpılma örneği](C:/Users/duran/Desktop/hsdWebFrontend/previews/audit-event-crop.png)

**Önerilen düzen:** Daha ölçülü başlık → kısa özet → tamamı görünen afiş/fotoğraf ve kompakt bilgi paneli → öne çıkanlar → varsa galeri veya kayıt → ilgili etkinlikler.

| Etkinlik | Özel öneri |
| --- | --- |
| Teknoloji ve Yenilik Zirvesi | Tarih ve tam mekânı doğrulamak; konuşmacı adlarını daha okunaklı bir listeye dönüştürmek; kaynak butonunu mümkünse ilgili gönderiye bağlamak. |
| Cumhuriyetin Kalbinde İnovasyon | Gezi tarihini ve gerçek ziyaret duraklarını doğrulamak; gerçek gezi fotoğrafları varsa küçük bir galeriyle anlatımı tamamlamak. |
| Yurt Dışı Kariyer Yolculuğu | Afişi bütünüyle göstermek; tarih ve saati korumak; doğrulanmış yayın kaydı varsa “Kaydı izle” bağlantısı eklemek. |
| Vision Fest II | Tarihi doğrulamak; kısa bir katılım anlatısı ve gerçek etkinlik fotoğraflarını sunmak. |
| Yörünge Muhafızı | Etkinlik kalıbının yanında projeye uygun “Problem, yaklaşım, sonuç” anlatımı kullanmak; ödül ve ekip bilgisini doğrulanmış haliyle sunmak. |

Şu an üç etkinliğin kaynak bağlantısı doğrudan ilgili paylaşım yerine şirket gönderi listesine gidiyor. Mümkün olduğunda tekil gönderi bağlantısı kullanılmalı. Gelecek etkinlikler eklendiğinde, detay şablonundaki sabit “tamamlanan faaliyet” metni durum bazında değişmeli.

## Medium yazıları

**İyi çalışanlar:** Kapak görselleri görünür, öne çıkan yazı net ve “Medium’da oku” eylemi doğru beklenti oluşturuyor.

**İyileştirmeler:** Doğrulanmış yazar, yayın tarihi ve okuma süresi eklemek. Öne çıkan yazıyı yalnızca dizinin ilk öğesi olmaktan çıkarıp bilinçli seçmek veya yayın tarihine göre belirlemek. Büyük kapak alanında 480 px kaynak görsel kullanıldığı için yüksek yoğunluklu ekranlarda daha büyük bir kaynak varyantı değerlendirmek.

Kapaklar Medium'un alan adından yükleniyor. Şu an görüntüleniyorlar; ancak yüklenemediğinde boş ve bozuk bir kart yerine düzeni koruyan bir görsel yedeği olmalı.

**Yeni fikir:** İçerik sayısı büyüdüğünde kategori filtresi. Medium RSS üzerinden periyodik güncelleme, otomatik yayına almak yerine önce onaylanabilir taslaklar üretmek için kullanılabilir.

## Ekip

**İyi çalışanlar:** Başkan → yardımcılar → komiteler hiyerarşisi net. Gerçek grup fotoğrafı güçlü. Mobil yerleşimde yatay taşma gözlenmedi.

Geçici isimler kullanılması daha önce istenmişti; bu bir uygulama hatası değil, tamamlanacak içerik. Gerçek isimler, görevler ve portrelerle değiştirilmesi görsel kalitedeki en büyük sıçramayı sağlayacak.

**Öneriler:** Tüm portrelerde aynı kadraj ve renk yaklaşımı; akademik dönem bilgisi; isteğe bağlı kişisel LinkedIn bağlantısı. Üye sayısı büyüdüğünde masaüstünde ağacı koruyup mobilde komite başlıkları altında düzenli üye listeleri kullanmak. Her üyeye zorunlu uzun biyografi eklemek gereksiz olur.

## Katılım

`applicationUrl` şu an boş; ana eylem Linktree bağlantısına gidiyor. Ziyaretçinin “katıl” beklentisi ile ulaştığı bağlantı listesi arasında ek adım var.

**Önerilen sıra:** Kısa başlık → başvuru durumu → belirgin eylem → üç kısa cevap: kimler katılabilir, nasıl katılınır, sonraki adım nedir?

Başvuru açıksa gerçek form bağlantısı; kapalıysa açık bir durum metni ve duyuru hesabı kullanılmalı. Form gelene kadar mevcut bağlantının işlevi dürüstçe anlatılmalı. Mobilde mevcut katılım eylemi sayfanın oldukça aşağısında kalıyor; girişin hemen altına taşınmalı. Teknik bilgi gerekip gerekmediği gibi sorular, yanıtları topluluk tarafından kesinleştirildikten sonra burada yer almalı.

## Üst menü, footer ve 404

- Üst menü sade ve aktif sayfa işareti anlaşılır. Mobil menü açılıyor; Escape ile kapanıp odağı menü butonuna döndürüyor. Mobil aktif sayfa işareti de eklenebilir.
- Uzun sayfalarda menüye geri erişim için ince bir sabit/yeniden görünür üst menü değerlendirilebilir. Hero ile çakışmaması ve sürekli kalabalık oluşturmaması gerekir.
- Yeni footer kompakt ve tutarlı. Şimdilik yeniden tasarım gerekmiyor. Mobilde sabit yukarı dön butonunun sosyal bağlantıların üzerine gelmemesi kontrol edilmeli.
- 404 sayfasının ana sayfaya dönüşü yeterli. İkinci bir “Etkinliklere git” bağlantısı eklenebilir; bu düşük öncelikli bir iyileştirme.

## Tipografi ve erişilebilirlik

İç sayfalarda başlıklar 40 px iken katılım ve etkinlik detaylarında mobil başlıklar 49 px. Uzun etkinlik adları bu nedenle oldukça fazla alan kaplıyor. Ortak bir ölçek ve başlık uzunluğuna göre sınırlandırma daha tutarlı olur.

Anlam taşıyan açıklamalar genel olarak 16–17 px seviyesinde. Kodda görünen bazı 7–8 px kurallar eski bileşenlere ait; bunları tüm aktif metinler için güncel hata saymamak gerekir. Aktif küçük kategori ve görev etiketleri gerektiğinde 12–14 px seviyesinde tutulabilir; dekoratif mikro yazılar azaltılabilir.

Odak stili, içeriğe geç bağlantısı ve azaltılmış hareket tercihini dikkate alan kod mevcut. Bunlar olumlu; kapsamlı erişilebilirlik uyumu iddiası için ek test gerekir. Dokunma alanlarında 44 px rahatlık hedefi; normal yazıda en az 4.5:1, büyük yazıda 3:1 kontrast kontrolü önerilir. WCAG 2.2 AA hedef boyutu alt sınırı istisnalarla 24 × 24 px'tir; 44 px burada daha rahat kullanım için tasarım hedefidir. [W3C hedef boyutu](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [W3C kontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Performans, SEO ve sürdürülebilirlik

- GSAP/ScrollTrigger ve Lenis ortak düzen üzerinden bütün sayfalara geliyor. Üretilmiş büyük ortak JS parçası yaklaşık 113 KB; bu sıkıştırılmamış dosya boyutudur, yükleme süresi ölçümü değildir. Sakin iç sayfalarda yerel kaydırma kullanıp animasyon paketlerini ana sayfaya ayırmak değerlendirilebilir.
- Büyük topluluk fotoğrafları için WebP/AVIF ve ekran boyutuna uygun kaynaklar üretilebilir. Görseller şu an aşırı büyük değil; bu iyileştirme gerçek ölçümlerle önceliklendirilmeli.
- Sayfa başlıkları ve canonical mevcut. Etkinlikler açıklamalarını ayrıca veriyor; diğer sayfalarda ortak açıklama kullanılıyor. Sayfaya özgü açıklamalar eklenmeli.
- OG paylaşım görseli, `og:url`, sosyal kart meta verileri, sitemap ve robots dosyası görünmüyor. Bunlar tamamlanmalı. Canonical için yapılandırılan alan adı, yayın yapılacak gerçek alan adıyla karşılaştırılmalı; localhost'tan farklı olması tek başına hata değildir.
- Gelecek etkinlik seçimi statik derleme sırasında yapılıyor. Tarih geçtikten sonra görünümün güncel kalması için yeniden derleme/güncelleme düzeni belirlenmeli.
- Etkinlik ve afiş verileri ayrı yerlerde tutuluyor. Ortak bir içerik şeması; tarih, durum, mekân, kaynak ve görsel oranı gibi alanların unutulmasını azaltır.
- Stil dosyalarında benzer bileşenlere ait birden çok kural var. Detay afişi kırpılması bunun somut örneği. Tüm CSS'i yeniden yazmak yerine kullanılan bileşenleri sırayla tek sahipli kurallara taşımak daha güvenli.
- Mevcut üç test; üretilen sayfaları, iç bağlantıları ve yerel varlıkları kontrol ediyor. Filtreler, mobil menü, doğrudan hash ile açılış ve görsel kırpılmalar için davranış/görsel kontrolleri eklenebilir.

## Uygulama sırası

1. Detay afişlerinin kırpılması ve başlık ölçeği: az müdahale, yüksek görsel kazanım.
2. Katılım akışı: gerçek bağlantı veya açık başvuru durumu; mobilde eylem daha yukarıda.
3. Etkinlik veri kalitesi: tarih, mekân, tekil kaynak ve kronolojik sıra.
4. Gerçek ekip verileri ve tutarlı portreler.
5. Mobil ana sayfanın hareket mesafesini kısaltmak; anlamsız küçük etiketleri azaltmak.
6. Paylaşım/SEO tamamlamaları ve ölçüme dayalı performans düzenlemeleri.
7. İçerik büyüdükçe galeri, yayın kaydı, arama ve içerik güncelleme araçları.

Önerilmeyen eklemeler: dekoratif sayaçlar, doğrulanmamış üye sayıları, sürekli hareketli iç sayfalar, şu aşamada karmaşık yönetim paneli ve ziyaretçiyi asıl içerikten uzaklaştıran pop-up'lar.
