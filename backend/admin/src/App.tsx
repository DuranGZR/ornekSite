import { useEffect, useState } from "react";
import { api, setCsrf } from "./api";
import { Login } from "./Login";
import { Editor } from "./Editor";
import { SiteVisualsEditor } from "./SiteVisualsEditor";
import { names, type Kind, type Item } from "./types";
export function App() {
  const [user, setUser] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [page, setPage] = useState<Kind | "overview" | "security" | "visuals">(
      "overview",
    ),
    [items, setItems] = useState<Record<Kind, Item[]>>({
      events: [],
      articles: [],
      team: [],
    }),
    [state, setState] = useState<any>({}),
    [audit, setAudit] = useState<any[]>([]),
    [editor, setEditor] = useState<Item | null | undefined>(undefined),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false);
  async function login() {
    try {
      const r = await api("auth/session");
      setCsrf(r.csrfToken);
      setUser(r.username);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  async function refresh() {
    const [events, articles, team, publication, logs] = await Promise.all([
      api("admin/content/events"),
      api("admin/content/articles"),
      api("admin/content/team"),
      api("admin/publication"),
      api("admin/audit"),
    ]);
    setItems({ events, articles, team });
    setState(publication);
    setAudit(logs);
  }
  useEffect(() => {
    login();
    const expire = () => {
      setUser(null);
      setEditor(undefined);
    };
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, []);
  useEffect(() => {
    if (user) refresh().catch((e) => setError(e.message));
  }, [user]);
  async function action(work: () => Promise<any>, message: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
      await refresh();
      setNotice(message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <main className="loading">Yönetim alanı açılıyor…</main>;
  if (!user) return <Login done={login} />;
  const kind =
    page === "events" || page === "articles" || page === "team" ? page : null;
  const filtered = kind
    ? items[kind].filter(
        (i) =>
          (i.draft.title ?? "Core team")
            .toLocaleLowerCase("tr")
            .includes(query.toLocaleLowerCase("tr")) ||
          (i.draft.category ?? "")
            .toLocaleLowerCase("tr")
            .includes(query.toLocaleLowerCase("tr")),
      )
    : [];
  return (
    <div className="shell">
      <aside className={"sidebar " + (menu ? "open" : "")}>
        <a className="brand" href="/">
          &lt; HSD &gt;<small>İNÖNÜ</small>
        </a>
        <span className="workspace-label">YÖNETİM ALANI</span>
        <nav>
          {(
            [
              "overview",
              "events",
              "articles",
              "team",
              "visuals",
              "security",
            ] as const
          ).map((p, i) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              onClick={() => {
                setPage(p);
                setEditor(undefined);
                setQuery("");
                setMenu(false);
                setError("");
                setNotice("");
              }}
            >
              <span>{["◈", "▦", "≡", "◎", "▧", "◇"][i]}</span>
              {p === "overview"
                ? "Genel bakış"
                : p === "security"
                  ? "Güvenlik & kayıtlar"
                  : names[p]}
            </button>
          ))}
        </nav>
        <div className="account">
          <div className="avatar">{user.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{user}</strong>
            <small>Yönetici · 2FA etkin</small>
          </div>
          <button
            aria-label="Çıkış yap"
            className="text-button"
            onClick={() =>
              action(async () => {
                await api("auth/logout", "POST");
                setCsrf("");
                setUser(null);
              }, "")
            }
          >
            ↗
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="menu-button secondary"
            onClick={() => setMenu(!menu)}
            aria-label="Menüyü aç"
          >
            ☰
          </button>
          <span>
            HSD İnönü{" "}
            <span className="muted">
              /{" "}
              {page === "overview"
                ? "Genel bakış"
                : page === "security"
                  ? "Güvenlik"
                  : names[page]}
            </span>
          </span>
          <span className="secure-dot">Güvenli oturum</span>
        </header>
        <main className="content">
          {error && (
            <div className="error banner" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="notice banner" role="status">
              {notice}
            </div>
          )}
          {page === "visuals" ? (
            <SiteVisualsEditor
              saved={() =>
                action(
                  async () => {},
                  "Görseller güncellendi. Yayınladıktan sonra genel bakıştan siteye aktar.",
                )
              }
            />
          ) : editor !== undefined && kind ? (
            <Editor
              key={editor?.id ?? "new"}
              kind={kind}
              item={editor}
              close={() => setEditor(undefined)}
              saved={() => {
                setEditor(undefined);
                action(async () => {}, "Taslak kaydedildi.");
              }}
            />
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">TOPLULUĞUN KONTROLÜ SENDE</span>
                  <h1>
                    {page === "overview"
                      ? "İyi fikirler, düzenli bir yer."
                      : page === "security"
                        ? "Güvenli ve izlenebilir."
                        : names[page] + "."}
                  </h1>
                  <p>
                    {page === "overview"
                      ? "Etkinlikleri, yazıları ve ekibini aynı yerden yönet."
                      : page === "security"
                        ? "Son yönetici işlemleri ve oturum politikası."
                        : kind === "team"
                          ? "Başkanlık, komiteler ve topluluğu bir araya getiren insanlar."
                          : "Yeni içerikler ekle, taslaklarını düzenle ve hazır olduklarında yayınla."}
                  </p>
                </div>
                {kind && (
                  <button
                    disabled={
                      busy || (kind === "team" && items.team.length > 0)
                    }
                    onClick={() => setEditor(null)}
                  >
                    + {kind === "team" ? "Ekip oluştur" : "Yeni içerik"}
                  </button>
                )}
              </div>
              {page === "overview" ? (
                <>
                  <div className="stats">
                    {(["events", "articles", "team"] as const).map((k) => (
                      <button
                        className="stat"
                        key={k}
                        onClick={() => setPage(k)}
                      >
                        <span>{names[k]} ↗</span>
                        <strong>
                          {k === "team"
                            ? (items.team[0]?.draft.committees.length ?? 0)
                            : items[k].length}
                        </strong>
                        <small>
                          {k === "team"
                            ? "komite"
                            : items[k].filter((i) => i.published).length +
                              " yayınlanan içerik"}
                        </small>
                      </button>
                    ))}
                  </div>
                  <section className="publication">
                    <div>
                      <span className="eyebrow">SİTEYE AKTARIM</span>
                      <h2>
                        {state.revision === state.exported_revision
                          ? "Her şey güncel."
                          : "Değişikliklerin hazır."}
                      </h2>
                      <p>
                        Yayınlanan içerikleri sitenin veri dosyasına aktar.
                        Taslaklar aktarılmaz.
                      </p>
                      {state.published_at && (
                        <small>
                          Son aktarım:{" "}
                          {new Date(state.published_at).toLocaleString("tr-TR")}
                        </small>
                      )}
                    </div>
                    <button
                      disabled={busy}
                      onClick={() =>
                        action(
                          () => api("admin/export", "POST"),
                          "Yayınlanan içerikler site dosyasına aktarıldı. Canlı site için dağıtım gerekir.",
                        )
                      }
                    >
                      {busy ? "Aktarılıyor…" : "Siteye aktar ↗"}
                    </button>
                  </section>
                  <div className="section-heading compact">
                    <h2>Çalışmaya devam et.</h2>
                  </div>
                  <div className="quick-links">
                    {(["events", "articles", "team"] as const).map((k) => (
                      <button
                        className="quick-link"
                        key={k}
                        onClick={() => setPage(k)}
                      >
                        {names[k]}
                        <span>↗</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : page === "security" ? (
                <>
                  <div className="security-cards">
                    <div>
                      <h3>İki aşamalı doğrulama</h3>
                      <p>Parola ve doğrulama kodu birlikte zorunlu.</p>
                    </div>
                    <div>
                      <h3>Sınırlı oturum</h3>
                      <p>
                        30 dakika hareketsizlik veya 8 saat sonunda yeniden
                        giriş gerekir.
                      </p>
                    </div>
                    <div>
                      <h3>Hesap kurtarma</h3>
                      <p>
                        Tek kullanımlık kodlarını güvenli tut. Parola ve MFA
                        sıfırlama yalnızca sunucu komutlarıyla yapılır.
                      </p>
                    </div>
                  </div>
                  <section className="audit">
                    <h2>İşlem geçmişi</h2>
                    {audit.map((a, i) => (
                      <div key={i}>
                        <strong>{a.action}</strong>
                        <span>{a.username ?? "Giriş denemesi"}</span>
                        <time>
                          {new Date(a.created_at).toLocaleString("tr-TR")}
                        </time>
                      </div>
                    ))}
                  </section>
                </>
              ) : (
                kind && (
                  <>
                    <label className="search">
                      <span>⌕</span>
                      <input
                        aria-label="İçerik ara"
                        placeholder={
                          kind === "team"
                            ? "Ekip ara…"
                            : "Başlık veya kategori ara…"
                        }
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <div className="item-list">
                      {filtered.map((i) => (
                        <article className="item" key={i.id}>
                          {kind !== "team" ? (
                            <img src={i.draft.image ?? i.draft.cover} alt="" />
                          ) : (
                            <div className="team-icon">◎</div>
                          )}
                          <div className="item-info">
                            <span className="status">
                              {i.published ? "Yayında" : "Taslak"}
                              {i.published &&
                              JSON.stringify(i.published) !==
                                JSON.stringify(i.draft)
                                ? " · Kaydedilmiş değişiklikler var"
                                : ""}
                            </span>
                            <h3>{i.draft.title ?? "HSD İnönü Core Team"}</h3>
                            <p>
                              {kind === "team"
                                ? `${i.draft.committees.length} komite · Başkan: ${i.draft.president.name}`
                                : i.draft.category}
                            </p>
                          </div>
                          <div className="item-actions">
                            <button
                              className="secondary"
                              onClick={() => setEditor(i)}
                            >
                              Düzenle
                            </button>
                            <button
                              disabled={busy}
                              onClick={() =>
                                action(
                                  () =>
                                    api("admin/publish/" + i.id, "POST", {
                                      version: i.version,
                                    }),
                                  "İçerik yayın listesine alındı. Genel bakıştan siteye aktarabilirsin.",
                                )
                              }
                            >
                              Yayınla
                            </button>
                            {kind !== "team" && (
                              <button
                                className="text-button danger"
                                disabled={busy}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Bu içerik silinsin mi? Siteye aktarınca siteden de kaldırılacak.",
                                    )
                                  )
                                    action(
                                      () =>
                                        api("admin/content/" + i.id, "DELETE", {
                                          version: i.version,
                                        }),
                                      "İçerik kaldırıldı.",
                                    );
                                }}
                              >
                                Sil
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                    {!filtered.length && (
                      <div className="empty">
                        <h2>
                          {query
                            ? "Burada bir eşleşme yok."
                            : "Yeni bir başlangıç."}
                        </h2>
                        <p>
                          {query
                            ? "Başka bir kelime dene veya aramayı temizle."
                            : "İlk içeriğini ekleyerek bu alanı doldur."}
                        </p>
                      </div>
                    )}
                  </>
                )
              )}
            </>
          )}
        </main>
        <footer className="panel-footer">
          <span>HSD İnönü</span>
          <span>Topluluğun için, özenle.</span>
        </footer>
      </div>
    </div>
  );
}
