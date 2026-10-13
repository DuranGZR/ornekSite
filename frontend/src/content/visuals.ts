import published from './published.json';
import gallery from './gallery.json';
import joinImages from './join-images.json';
export interface GalleryPhoto extends SiteImage {
  row: number;
}
export interface SiteImage {
  image: string;
  alt: string;
  width: number;
  height: number;
}
export interface SiteVisuals {
  logo: SiteImage;
  home: SiteImage;
  community: SiteImage;
  team: SiteImage;
  joinMain: SiteImage;
  joinSmall: SiteImage;
  gallery?: GalleryPhoto[];
}
export const initialVisuals: SiteVisuals = {
  ...joinImages,
  logo: {
    image: '/hsd-logo.svg',
    alt: 'Huawei Student Developers',
    width: 480,
    height: 180,
  },
  home: {
    image: '/photos/community-1280.webp',
    alt: 'HSD İnönü topluluk buluşmasında çekilen grup fotoğrafı',
    width: 1280,
    height: 960,
  },
  community: {
    image: '/photos/gathering-1280.webp',
    alt: 'HSD İnönü buluşmasında konuşmacıyı dinleyen katılımcılar',
    width: 1280,
    height: 960,
  },
  team: {
    image: '/photos/community-1280.webp',
    alt: 'HSD İnönü topluluk buluşmasında bir araya gelen ekip',
    width: 1280,
    height: 960,
  },
  gallery,
};
export const siteVisuals: SiteVisuals = {
  ...initialVisuals,
  ...(published as unknown as { visuals?: Partial<SiteVisuals> } | null)
    ?.visuals,
};
