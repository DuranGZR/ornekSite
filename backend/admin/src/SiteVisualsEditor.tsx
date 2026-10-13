import { useEffect, useState } from "react";
import { api } from "./api";
import { Media } from "./Editor";
import { Field } from "./Field";
import type { Item } from "./types";
import { GalleryEditor, type GalleryPhoto } from "./GalleryEditor";
import initialGallery from "../../../frontend/src/content/gallery.json";
import joinImages from "../../../frontend/src/content/join-images.json";
type Image = { image: string; alt: string; width: number; height: number };
type Visuals = Record<
  "logo" | "home" | "community" | "team" | "joinMain" | "joinSmall",
  Image
> & {
  gallery?: GalleryPhoto[];
};
const sections = [
  [
    "joinMain",
    "Katıl sayfası — büyük fotoğraf",
    "Kayıt düğmesinin yanındaki ana topluluk fotoğrafı.",
  ],
  [
    "joinSmall",
    "Katıl sayfası — küçük fotoğraf",
    "Büyük fotoğrafın üzerine yerleşen küçük fotoğraf.",
  ],
  [
    "logo",
    "Site logosu",
    "Üst menü ve alt bilgi. Şeffaf arka plan için PNG veya WebP kullan.",
  ],
  [
    "home",
    "Ana sayfa topluluk fotoğrafı",
    "“İyi ki bir aradayız” bölümündeki büyük fotoğraf.",
  ],
  [
    "community",
    "Topluluk sayfası kapağı",
    "Topluluğu anlattığımız sayfanın açılış fotoğrafı.",
  ],
  [
    "team",
    "Ekip sayfası kapağı",
    "Core team listesinin üzerindeki toplu fotoğraf.",
  ],
] as const;
export function SiteVisualsEditor({ saved }: { saved: () => void }) {
  const [item, setItem] = useState<Item | null>(null),
    [data, setData] = useState<Visuals | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(() => {
    api("admin/content/visuals")
      .then((items: Item[]) => {
        if (!items[0])
          throw new Error(
            "Görsel ayarları hazır değil. Veritabanı geçişini çalıştır.",
          );
        setItem(items[0]);
        setData({
          ...joinImages,
          ...items[0].draft,
          gallery: items[0].draft.gallery ?? initialGallery,
        });
      })
      .catch((e) => setError(e.message));
  }, []);
  async function save(publish: boolean) {
    if (!item || !data) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      let next = await api("admin/content/visuals/" + item.id, "PATCH", {
        data,
        version: item.version,
      });
      if (publish)
        next = await api("admin/publish/" + next.id, "POST", {
          version: next.version,
        });
      setItem(next);
      setNotice(
        publish
          ? "Görseller yayın listesine alındı. Genel bakış → Siteye aktar ile siteye uygula."
          : "Görseller taslak olarak kaydedildi.",
      );
      saved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">SİTENİN GÖRSEL KİMLİĞİ</span>
          <h1>Site görselleri.</h1>
          <p>
            Logonu ve sayfa kapaklarını tek yerden güncelle. Her fotoğrafı
            bağımsız değiştirebilirsin.
          </p>
        </div>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="notice banner" role="status">
          {notice}
        </p>
      )}
      {data && (
        <>
          <div className="visuals-grid">
            {sections.map(([key, title, description]) => (
              <section
                className={"visual-card " + (key === "logo" ? "logo-card" : "")}
                key={key}
              >
                <h3>{title}</h3>
                <p>{description}</p>
                <Media
                  value={data[key].image}
                  change={(image, width, height) =>
                    setData((old) =>
                      old
                        ? {
                            ...old,
                            [key]: { ...old[key], image, width, height },
                          }
                        : old,
                    )
                  }
                />
                <Field
                  label="Görsel açıklaması"
                  value={data[key].alt}
                  onChange={(alt) =>
                    setData((old) =>
                      old ? { ...old, [key]: { ...old[key], alt } } : old,
                    )
                  }
                />
              </section>
            ))}
          </div>
          <GalleryEditor
            photos={data.gallery ?? []}
            change={(gallery) =>
              setData((old) => (old ? { ...old, gallery } : old))
            }
          />
          <div className="save-bar">
            <span>Kaydet → Yayınla → Genel bakıştan Siteye aktar.</span>
            <div className="actions">
              <button
                className="secondary"
                disabled={busy}
                onClick={() => save(false)}
              >
                Taslağı kaydet
              </button>
              <button disabled={busy} onClick={() => save(true)}>
                {busy ? "Kaydediliyor…" : "Kaydet ve yayınla ↗"}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
