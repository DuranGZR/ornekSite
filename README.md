# HSD İnönü

`frontend/` halka açık Astro sitesi, `backend/` ise NestJS API ve React yönetim panelidir. Git deposu ana klasördedir ve iki uygulamayı da kapsar. Önceki frontend commit geçmişi korunmuştur.

## GitHub'a hazırlık

Kaynak kod, package-lock.json dosyaları, backend/.env.example, herkese açık görseller, frontend/src/content/published.json ve frontend/public/managed-media/ repoya dahil edilir. Yayınlanmış içerik ve görseller statik sitenin yeniden kurulabilmesi için gereklidir.

.env dosyaları, backend/var/ altındaki hesaplar ve veritabanı, bağımlılıklar, derleme çıktıları, loglar, özel anahtarlar, yedekler, yerel taslaklar, önizlemeler ve .openai/ bağlantısı .gitignore ile dışarıda tutulur. Bunları GitHub'a elle yüklemeyin veya git add -f ile zorla eklemeyin. Ignore kuralları kaynak kodun içine yazılan sırları tespit etmez.

Git komutlarını bu ana klasörde çalıştırın. Göndermeden önce git status --short ve git diff --cached --name-only ile dosya listesini inceleyin. Yeni bilgisayarda backend yapılandırmasını ve admin hesabını yeniden oluşturun; yerel .env veya var/ dosyalarını paylaşmayın.
