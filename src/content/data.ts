export interface CommunityEvent {
  slug: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  image: string;
  agenda: string[];
  speakers: string[];
}
export const events: CommunityEvent[] = [
  {
    slug: 'birlikte-uret',
    title: 'Bir fikir. Bir ekip. İlk adım.',
    category: 'Atölye',
    date: '2026-11-14T14:00:00+03:00',
    location: 'İnönü Üniversitesi · Örnek salon',
    description:
      'Bir fikri küçük bir prototipe dönüştürmek için bir araya geliyoruz. Tasarla, dene, paylaş; ilk adımı birlikte atalım.',
    image: 'photo-1522071820081-009f0129c71c',
    agenda: [
      '14.00 — Tanışma ve fikir paylaşımı',
      '14.30 — Küçük ekiplerle prototipleme',
      '16.00 — Sunumlar ve geri bildirim',
    ],
    speakers: ['Deniz · Demo atölye yürütücüsü'],
  },
  {
    slug: 'yapay-zeka-bulusmasi',
    title: 'Yapay zekânın ötesinde ne var?',
    category: 'Söyleşi',
    date: '2026-12-05T15:00:00+03:00',
    location: 'Çevrim içi · Demo etkinlik',
    description:
      'Yapay zekâyı günlük üretim sürecinde nasıl kullanabiliriz? Sorular, deneyimler ve yeni bakış açıları.',
    image: 'photo-1516321318423-f06f85e504b3',
    agenda: [
      '15.00 — Açılış',
      '15.15 — Deneyimler ve örnekler',
      '16.00 — Açık soru-cevap',
    ],
    speakers: ['Ece · Demo konuşmacı'],
  },
  {
    slug: 'kampuste-tanisma',
    title: 'Ekranların dışında, bir arada.',
    category: 'Buluşma',
    date: '2026-09-20T13:00:00+03:00',
    location: 'Kampüs · Demo buluşma',
    description:
      'Yeni yüzler, ortak meraklar ve uzun sohbetler. Döneme birlikte başladığımız bir tanışma buluşması.',
    image: 'photo-1528605248644-14dd04022da1',
    agenda: ['13.00 — Tanışma', '13.30 — Topluluk sohbeti'],
    speakers: [],
  },
];
export const articles = [
  {
    title: 'PyTorch ile görüntü sınıflandırma',
    category: 'Yapay zekâ',
    description: 'Görüntülerden öğrenen modellerin dünyasına bir giriş.',
    glyph: 'AI',
    href: 'https://medium.com/@hsdinonu',
  },
  {
    title: 'Kodun arkasındaki tasarım',
    category: 'Yazılım',
    description:
      'Factory Design Pattern ve nesne üretimi üzerine topluluk yazıları.',
    glyph: '</>',
    href: 'https://medium.com/@hsdinonu',
  },
  {
    title: 'Dijital dünyada verilerimiz',
    category: 'Teknoloji',
    description:
      'Veri saklama prensiplerini ve geleceğin teknolojilerini keşfet.',
    glyph: '01',
    href: 'https://medium.com/@hsdinonu',
  },
];
export const team = [
  { name: 'Deniz Yılmaz', role: 'Topluluk koordinasyonu', initials: 'DY' },
  { name: 'Ece Demir', role: 'Etkinlik ve organizasyon', initials: 'ED' },
  { name: 'Arda Kaya', role: 'Teknik ekip', initials: 'AK' },
  { name: 'Selin Aydın', role: 'Tasarım ve iletişim', initials: 'SA' },
  { name: 'Mert Çelik', role: 'İçerik ve Medium', initials: 'MÇ' },
  { name: 'Duru Şahin', role: 'Topluluk ilişkileri', initials: 'DŞ' },
];
export const photo = (id: string, width = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
