import { z } from "zod";
const text = (max = 200) => z.string().trim().min(1).max(max);
export const mediaUrl = z
  .string()
  .max(2048)
  .refine((value) => {
    if (value.startsWith("/") && !value.startsWith("//"))
      return (
        !value.includes("..") &&
        /^\/[a-zA-Z0-9/_ .-]+\.(jpg|jpeg|png|webp)$/i.test(value)
      );
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Yerel görsel yolu veya HTTPS bağlantısı kullan.");
const httpsUrl = z
  .url()
  .max(2048)
  .refine((v) => new URL(v).protocol === "https:", "HTTPS bağlantısı gerekli.");
const list = z.array(text(500)).max(40);
const isoDate = z.union([z.iso.date(), z.iso.datetime({ offset: true })]);
const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const eventSchema = z
  .object({
    slug,
    title: text(),
    status: z.enum(["completed", "upcoming"]),
    category: text(80),
    date: isoDate.optional(),
    location: text(250),
    description: text(3000),
    image: mediaUrl,
    imageWidth: z.number().int().positive().max(12000),
    imageHeight: z.number().int().positive().max(12000),
    imageAlt: text(300),
    source: httpsUrl,
    agenda: list,
    speakers: list,
    recording: httpsUrl.optional(),
  })
  .strict()
  .refine((v) => v.status !== "upcoming" || !!v.date, {
    message: "Yaklaşan etkinlik için tarih gerekli.",
    path: ["date"],
  });
export const articleSchema = z
  .object({
    title: text(),
    category: text(80),
    description: text(1000),
    cover: mediaUrl,
    published: isoDate,
    author: text(120),
    readingMinutes: z.number().int().min(1).max(180),
    href: httpsUrl.refine((v) => {
      const host = new URL(v).hostname;
      return host === "medium.com" || host.endsWith(".medium.com");
    }, "Medium bağlantısı gerekli."),
  })
  .strict();
export const memberSchema = z
  .object({ name: text(120), role: text(120), photo: mediaUrl.optional() })
  .strict();
const committeeSchema = z
  .object({
    name: text(120),
    description: text(500),
    members: z.array(memberSchema).min(1).max(80),
  })
  .strict();
export const teamSchema = z
  .object({
    isExample: z.boolean(),
    president: memberSchema,
    vicePresidents: z.array(memberSchema).max(8),
    committees: z.array(committeeSchema).max(20),
  })
  .strict()
  .refine(
    (v) =>
      new Set(v.committees.map((c) => c.name.toLocaleLowerCase("tr"))).size ===
      v.committees.length,
    "Komite adları benzersiz olmalı.",
  );
const siteImage = z
  .object({
    image: mediaUrl,
    alt: text(300),
    width: z.number().int().positive().max(12000),
    height: z.number().int().positive().max(12000),
  })
  .strict();
export const visualsSchema = z
  .object({
    logo: siteImage.extend({
      image: z.union([mediaUrl, z.literal("/hsd-logo.svg")]),
    }),
    home: siteImage,
    community: siteImage,
    team: siteImage,
    joinMain: siteImage.optional(),
    joinSmall: siteImage.optional(),
    gallery: z
      .array(
        siteImage
          .extend({
            row: z.number().int().min(1).max(3),
          })
          .strict(),
      )
      .max(60)
      .optional(),
  })
  .strict();
export const kindSchema = z.enum(["events", "articles", "team", "visuals"]);
export type Kind = z.infer<typeof kindSchema>;
export const contentSchemas = {
  events: eventSchema,
  articles: articleSchema,
  team: teamSchema,
  visuals: visualsSchema,
};
export const writeSchema = z
  .object({
    data: z.unknown(),
    version: z.number().int().positive().optional(),
  })
  .strict();
export type ContentData =
  | z.infer<typeof eventSchema>
  | z.infer<typeof articleSchema>
  | z.infer<typeof teamSchema>
  | z.infer<typeof visualsSchema>;
