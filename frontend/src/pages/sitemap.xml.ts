import type { APIRoute } from 'astro';
import { site, navigation } from '../config/site';
import { events } from '../content/data';

export const GET: APIRoute = () => {
  const routes = [
    '/',
    ...navigation.map((item) => item.href),
    '/katil/',
    ...events.map((event) => `/etkinlikler/${event.slug}/`),
  ];
  const entries = routes
    .map((path) => `<url><loc>${new URL(path, site.origin).href}</loc></url>`)
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
