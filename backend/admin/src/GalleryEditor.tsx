import { Media } from "./Editor";
import { Field } from "./Field";
export type GalleryPhoto = {
  image: string;
  alt: string;
  width: number;
  height: number;
  row: number;
};
export function GalleryEditor({
  photos,
  change,
}: {
  photos: GalleryPhoto[];
  change: (photos: GalleryPhoto[]) => void;
}) {
  const update = (index: number, patch: Partial<GalleryPhoto>) =>
    change(
      photos.map((photo, i) => (i === index ? { ...photo, ...patch } : photo)),
    );
  const move = (index: number, direction: number) => {
    const row = photos[index].row;
    let target = index + direction;
    while (target >= 0 && target < photos.length && photos[target].row !== row)
      target += direction;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    change(next);
  };
  return (
    <section className="gallery-editor">
      <h2>Topluluk galerisi.</h2>
      <p>
        Üç film şeridindeki fotoğrafları düzenle. Üst ve alt şerit sağa, orta
        şerit sola akar. Boş bıraktığın şerit gösterilmez.
      </p>
      {[1, 2, 3].map((row) => (
        <section key={row} className="gallery-row-editor">
          <h3>
            {row}. film şeridi {row === 2 ? "←" : "→"}
          </h3>
          <div className="visuals-grid">
            {photos.map(
              (photo, index) =>
                photo.row === row && (
                  <section className="visual-card" key={index}>
                    <Media
                      value={photo.image}
                      change={(image, width, height) =>
                        update(index, { image, width, height })
                      }
                    />
                    <Field
                      label="Görsel açıklaması (erişilebilirlik)"
                      value={photo.alt}
                      onChange={(alt) => update(index, { alt })}
                    />
                    <label className="field">
                      <span>Film şeridi</span>
                      <select
                        value={photo.row}
                        onChange={(event) =>
                          update(index, { row: Number(event.target.value) })
                        }
                      >
                        {[1, 2, 3].map((value) => (
                          <option key={value} value={value}>
                            {value}. şerit
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="actions">
                      <button
                        type="button"
                        className="secondary"
                        disabled={
                          !photos.slice(0, index).some((p) => p.row === row)
                        }
                        onClick={() => move(index, -1)}
                        aria-label={`${photo.alt || "Fotoğraf"}: önceye taşı`}
                      >
                        ← Önceye
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        disabled={
                          !photos.slice(index + 1).some((p) => p.row === row)
                        }
                        onClick={() => move(index, 1)}
                        aria-label={`${photo.alt || "Fotoğraf"}: sonraya taşı`}
                      >
                        Sonraya →
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() =>
                          change(photos.filter((_, i) => i !== index))
                        }
                      >
                        Kaldır
                      </button>
                    </div>
                  </section>
                ),
            )}
          </div>
          <button
            type="button"
            className="secondary"
            disabled={photos.length >= 60}
            onClick={() =>
              change([
                ...photos,
                {
                  image: "",
                  alt: "",
                  width: 1280,
                  height: 960,
                  row,
                },
              ])
            }
          >
            + Bu şeride fotoğraf ekle
          </button>
        </section>
      ))}
      {photos.length === 0 && (
        <p>
          Galeri boş. Yayınlayıp siteye aktardığında galeri bölümü gizlenir.
        </p>
      )}
    </section>
  );
}
