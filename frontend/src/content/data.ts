export interface CommunityEvent {
  status: 'completed' | 'upcoming';
  slug: string;
  title: string;
  category: string;
  date?: string;
  location: string;
  description: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  source: string;
  agenda: string[];
  speakers: string[];
  recording?: string;
}
import publishedData from './published.json';
export const initialEvents: CommunityEvent[] = [
  {
    slug: 'teknoloji-ve-yenilik-zirvesi',
    status: 'completed',
    title: 'Teknoloji ve Yenilik Zirvesi',
    category: 'Zirve',
    location: 'Malatya',
    description:
      'HSD İnönü, HSD Fırat ve HSD Malatya Turgut Özal toplulukları; teknoloji, sektör deneyimleri ve yeni fikirler için aynı zirvede buluştu.',
    image: '/community/teknoloji-zirvesi.jpg',
    imageWidth: 480,
    imageHeight: 600,
    imageAlt:
      'Teknoloji ve Yenilik Zirvesi topluluk paylaşımı ve ekip fotoğrafı',
    source: 'https://www.linkedin.com/company/hsdin%C3%B6n%C3%BC/posts/',
    agenda: [
      'Üç üniversitenin toplulukları arasında iş birliği',
      'Teknoloji ve kariyer üzerine deneyim paylaşımı',
      'Sektör temsilcileriyle tanışma ve fikir alışverişi',
    ],
    speakers: [
      'Deniz Yalçın',
      'Fazıl Göleç',
      'Betül Gündüz Odabaşı',
      'Tuncay Erol',
    ],
  },
  {
    slug: 'cumhuriyetin-kalbinde-inovasyon',
    status: 'completed',
    title: 'Cumhuriyetin Kalbinde İnovasyon',
    category: 'Teknik gezi',
    location: 'Ankara',
    description:
      'ÜNİDES desteğiyle 32 kişilik HSD İnönü ekibi, Ankara’da teknoloji ve kültürü bir araya getiren bir yolculuğa çıktı.',
    image: '/community/ankara.jpg',
    imageWidth: 480,
    imageHeight: 600,
    imageAlt: 'HSD İnönü Ankara gezisinin topluluk paylaşımı',
    source:
      'https://tr.linkedin.com/posts/hsdin%C3%B6n%C3%BC_huaweistudentdevelopers-hsdin%C3%B6n%C3%BC-%C3%BCnides-activity-7404807327679201284-WZgM',
    agenda: [
      'Teknik ve kültürel ziyaretler',
      'Girişimcilik ve inovasyon ekosistemini yakından tanıma',
      'Gençlik ve Spor Bakanlığı ÜNİDES programı desteği',
    ],
    speakers: [],
  },
  {
    slug: 'yurt-disi-kariyer-yolculugu',
    status: 'completed',
    title: 'Sektörel Sohbetler: Yurt Dışı Kariyer Yolculuğu',
    category: 'Söyleşi',
    date: '2026-01-22T18:30:00+03:00',
    location: 'HDG Türkiye YouTube kanalı · Çevrim içi',
    description:
      'Sektörel Sohbetler’in altıncı bölümünde Koray Göçmen ile global yazılım kariyeri, yurt dışında çalışma ve gelişim üzerine konuştuk.',
    image: '/community/sektorel-sohbetler.jpg',
    imageWidth: 480,
    imageHeight: 600,
    imageAlt: 'Koray Göçmen ile Yurt Dışı Kariyer Yolculuğu yayın afişi',
    source:
      'https://www.linkedin.com/posts/sektaemrelsohbetler-techcareer-seniorsoftwareengineer-share-7419324562833801216-e4te/',
    agenda: [
      'Yurt dışında çalışma ve adaptasyon',
      'Teknik ve kişisel yetkinlikler',
      'Gerçek sektör deneyimleriyle kariyer planlama',
    ],
    speakers: ['Koray Göçmen'],
    recording: 'https://l24.im/kS0DudE',
  },
  {
    slug: 'vision-fest-ii',
    status: 'completed',
    title: 'Vision Fest II',
    category: 'Zirve',
    location: 'Fırat Üniversitesi',
    description:
      'HSD Fırat’ın ev sahipliğinde gerçekleşen Vision Fest II’de farklı topluluklarla bir araya geldik; teknoloji ve girişimcilik üzerine deneyimler paylaştık.',
    image: '/community/vision-fest.jpg',
    imageWidth: 800,
    imageHeight: 600,
    imageAlt: 'Vision Fest II etkinliğinde HSD İnönü ekibi',
    source: 'https://www.linkedin.com/company/hsdin%C3%B6n%C3%BC/posts/',
    agenda: [
      'Üniversite topluluklarıyla buluşma',
      'Teknoloji ve girişimcilik odağında deneyim paylaşımı',
    ],
    speakers: [],
  },
  {
    slug: 'yorunge-muhafizi',
    status: 'completed',
    title: 'Yörünge Muhafızı: İNÜFEST üçüncülüğü',
    category: 'Proje',
    location: 'İnönü Üniversitesi · İNÜFEST',
    description:
      'Yörünge Muhafızı projesiyle İNÜFEST’te üçüncülük elde eden ekibimiz, birlikte üretmenin gücünü ortaya koydu.',
    image: '/community/yorunge-muhafizi.jpg',
    imageWidth: 480,
    imageHeight: 640,
    imageAlt: 'Yörünge Muhafızı proje ekibinin İNÜFEST paylaşımı',
    source: 'https://www.linkedin.com/company/hsdin%C3%B6n%C3%BC/posts/',
    agenda: ['Yörünge Muhafızı projesi', 'İNÜFEST üçüncülük derecesi'],
    speakers: [],
  },
];
export const initialArticles = [
  {
    title: 'Dijital Dünyada Verilerimiz Nasıl Saklanıyor?',
    category: 'Teknoloji',
    published: '2026-05-22',
    author: 'HSD İnönü Üniversitesi',
    readingMinutes: 4,
    description:
      'Veri depolamanın temelleri ve gelecekte bizi bekleyen teknolojiler.',
    cover:
      'https://miro.medium.com/v2/resize:fill:480:318/1*H1Gsq8t1RnSbXbxNVUfEsg.png',
    href: 'https://medium.com/huawei-student-developers-turkiye/dijital-d%C3%BCnyada-verilerimiz-nas%C4%B1l-saklan%C4%B1yor-4b5124448848',
  },
  {
    title: 'İnsanlığın Yeni Gözleri: Algoritmalar Evreni Nasıl Okuyor?',
    category: 'Yapay zekâ',
    published: '2026-05-01',
    author: 'HSD İnönü Üniversitesi',
    readingMinutes: 3,
    description: 'Uydu verilerinden keşfe: yapay zekâ ve görüntü işleme.',
    cover:
      'https://miro.medium.com/v2/resize:fill:480:318/1*UhrAi0hpXjL3x5P2ORp_xA.png',
    href: 'https://medium.com/huawei-student-developers-turkiye/i%CC%87nsanl%C4%B1%C4%9F%C4%B1n-yeni-g%C3%B6zleri-algoritmalar-evreni-nas%C4%B1l-okuyor-12f525ec1022',
  },
  {
    title: 'AOP Nedir? Spring Boot ile Cross-Cutting Concerns Yönetimi',
    category: 'Yazılım',
    published: '2026-04-24',
    author: 'HSD İnönü Üniversitesi',
    readingMinutes: 5,
    description:
      'Spring Boot projelerinde ortak sorumlulukları AOP ile yönetmek.',
    cover:
      'https://miro.medium.com/v2/resize:fill:480:318/1*Jbek_OjYOeZdIQzz5oxL0A.jpeg',
    href: 'https://medium.com/huawei-student-developers-turkiye/aop-nedir-spring-boot-ile-cross-cutting-concerns-y%C3%B6netimi-e5e41f431448',
  },
  {
    title:
      'JVM’de Garbage Collection Nasıl Çalışır? G1GC, ZGC ve Performans Pratikleri',
    category: 'Yazılım',
    published: '2026-03-31',
    author: 'HSD İnönü Üniversitesi',
    readingMinutes: 6,
    description:
      'JVM bellek yönetimi, G1GC ve ZGC arasındaki farklar ve performans ölçümü.',
    cover:
      'https://miro.medium.com/v2/resize:fill:480:318/1*woX44-hxmsoQyKGQOtMuAA.png',
    href: 'https://medium.com/huawei-student-developers-turkiye/jvmde-garbage-collection-nas%C4%B1l-%C3%A7al%C4%B1%C5%9F%C4%B1r-g1gc-zgc-ve-performans-pratikleri-bba4db14f2fa',
  },
  {
    title: 'SonarQube Nedir? Spring Boot Projesi Üzerinde Kod Kalitesi Analizi',
    category: 'Yazılım',
    published: '2026-03-25',
    author: 'HSD İnönü Üniversitesi',
    readingMinutes: 6,
    description:
      'Spring Boot projesinde SonarQube kurulumu, kod analizi ve sonuçların yorumlanması.',
    cover:
      'https://miro.medium.com/v2/resize:fill:480:318/1*xUiBq1fHc4Kv-e-hG1eZSw.png',
    href: 'https://medium.com/@hsdinonu/sonarqube-nedir-spring-boot-projesi-%C3%BCzerinde-kod-kalitesi-analizi-613538a490d9',
  },
];
export const projectTeam = [
  'Utku Bera Özkan',
  'Samet Erkalp',
  'Tahir Kılıç',
  'Fatmanur Bakırcı',
  'Hamza Aslanbaba',
];
export const contributors = [
  {
    name: 'Elif İrem Kaya',
    contribution: 'İnsanlığın Yeni Gözleri · Medium yazısı',
    href: initialArticles[1].href,
  },
  {
    name: 'Ali Osman Kaylı',
    contribution: 'PyTorch ile Görüntü Sınıflandırma · Medium yazısı',
    href: 'https://medium.com/@hsdinonu',
  },
  {
    name: 'Merve Kaya',
    contribution: 'Kuantum teknolojileri üzerine Medium yazıları',
    href: 'https://medium.com/@hsdinonu',
  },
];

const snapshot = publishedData as {
  events: CommunityEvent[];
  articles: typeof initialArticles;
} | null;
export const events = snapshot?.events ?? initialEvents;
export const articles = snapshot?.articles ?? initialArticles;
export interface ArchivedPoster {
  image: string;
  title: string;
  date: string;
  location: string;
}
export const archivedPosters: ArchivedPoster[] = [
  {
    image: '/1758289985957.jpg',
    title: 'Sektörel Sohbetler · Barış Subaşı',
    date: '2025-09-26T20:00:00+03:00',
    location: 'HDG Türkiye YouTube kanalı',
  },
  {
    image: '/1765791369715.jpg',
    title: 'Cloud Night-1 · Uğur Çetinkaya',
    date: '2025-12-19',
    location: 'İnönü Üniversitesi · SKS Konferans Salonu',
  },
];
