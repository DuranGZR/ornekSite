export type Kind = "events" | "articles" | "team";
export type Item = {
  id: string;
  draft: any;
  published: any;
  version: number;
  updated_at: string;
};
export type Member = { name: string; role: string; photo?: string };
export const names = {
  events: "Etkinlikler",
  articles: "Medium yazıları",
  team: "Core team",
  visuals: "Site görselleri",
};
