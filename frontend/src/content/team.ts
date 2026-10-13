export interface CoreMember {
  name: string;
  role: string;
  photo?: string;
}
export interface Committee {
  name: string;
  description: string;
  members: CoreMember[];
}
// Temporary sample roster approved for layout preview. Replace names and add
// local portrait paths (photo: '/team/person.jpg') before publishing the roster.
import publishedData from './published.json';
export const initialCoreTeam = {
  isExample: true,
  president: { name: 'Arda Aydın', role: 'Topluluk Başkanı' } as CoreMember,
  vicePresidents: [
    { name: 'Duru Şahin', role: 'Başkan Yardımcısı' },
    { name: 'Emre Aksoy', role: 'Başkan Yardımcısı' },
  ] as CoreMember[],
  committees: [
    {
      name: 'Sosyal Medya & Tasarım',
      description: 'Topluluğun sesi ve görsel dünyası.',
      members: [
        { name: 'Asya Yıldız', role: 'Komite Başkanı' },
        { name: 'Eylül Arslan', role: 'Komite Üyesi' },
        { name: 'Mert Demir', role: 'Komite Üyesi' },
      ],
    },
    {
      name: 'DevOps & JuniorOps',
      description: 'Teknik altyapı ve birlikte geliştirme.',
      members: [
        { name: 'Bora Çelik', role: 'Komite Başkanı' },
        { name: 'Selin Yalçın', role: 'Komite Üyesi' },
        { name: 'Kerem Güneş', role: 'Komite Üyesi' },
      ],
    },
    {
      name: 'Organizasyon',
      description: 'Fikirlerden buluşmalara, her ayrıntı.',
      members: [
        { name: 'Ada Koç', role: 'Komite Başkanı' },
        { name: 'Ege Özdemir', role: 'Komite Üyesi' },
        { name: 'İpek Acar', role: 'Komite Üyesi' },
      ],
    },
    {
      name: 'İletişim & Sponsorluk',
      description: 'İş birlikleri ve topluluğun bağlantıları.',
      members: [
        { name: 'Deniz Eren', role: 'Komite Başkanı' },
        { name: 'Nazlı Acar', role: 'Komite Üyesi' },
        { name: 'Can Yılmaz', role: 'Komite Üyesi' },
      ],
    },
  ] as Committee[],
};
export const coreTeam: typeof initialCoreTeam = (publishedData as { coreTeam: typeof initialCoreTeam | null } | null)?.coreTeam ?? initialCoreTeam;
