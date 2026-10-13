import React, { useState } from "react";
import { api } from "./api";
import { Field } from "./Field";
import { names, type Kind, type Item, type Member } from "./types";
const emptyEvent = {
  slug: "",
  title: "",
  status: "completed",
  category: "",
  location: "",
  description: "",
  image: "",
  imageWidth: 480,
  imageHeight: 600,
  imageAlt: "",
  source: "",
  agenda: [],
  speakers: [],
};
const emptyArticle = {
  title: "",
  category: "",
  description: "",
  cover: "",
  published: new Date().toISOString().slice(0, 10),
  author: "",
  readingMinutes: 5,
  href: "",
};
const emptyTeam = {
  isExample: true,
  president: { name: "", role: "Topluluk Başkanı" },
  vicePresidents: [],
  committees: [],
};
export function Media({
  value,
  change,
}: {
  value: string;
  change: (url: string, width: number, height: number) => void;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const r = await api("admin/media", "POST", body);
      change(r.url, r.width, r.height);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="media-control">
      {value && <img src={value} alt="Görsel önizlemesi" />}
      <Field
        label="Görsel yolu / HTTPS bağlantısı"
        value={value}
        onChange={(v) => change(v, 480, 600)}
      />
      <label className="upload">
        {busy ? "Yükleniyor…" : "Görsel yükle ↗"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </label>
      <small>JPG, PNG, WebP · En fazla 8 MB</small>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
function MemberEditor({
  member,
  change,
  remove,
}: {
  member: Member;
  change: (v: Member) => void;
  remove?: () => void;
}) {
  return (
    <div className="member-editor">
      <div className="two-fields">
        <Field
          label="Ad soyad"
          value={member.name}
          onChange={(name) => change({ ...member, name })}
        />
        <Field
          label="Görev"
          value={member.role}
          onChange={(role) => change({ ...member, role })}
        />
      </div>
      <Media
        value={member.photo ?? ""}
        change={(photo) => change({ ...member, photo: photo || undefined })}
      />
      {remove && (
        <button type="button" className="text-button danger" onClick={remove}>
          Kişiyi kaldır
        </button>
      )}
    </div>
  );
}
export function Editor({
  kind,
  item,
  close,
  saved,
}: {
  kind: Kind;
  item: Item | null;
  close: () => void;
  saved: () => void;
}) {
  const [data, setData] = useState<any>(() =>
      structuredClone(
        item?.draft ??
          (kind === "events"
            ? emptyEvent
            : kind === "articles"
              ? emptyArticle
              : emptyTeam),
      ),
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const update = (key: string, value: any) =>
    setData((old: any) => ({ ...old, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(
        "admin/content/" + kind + (item ? "/" + item.id : ""),
        item ? "PATCH" : "POST",
        {
          data:
            kind === "events"
              ? {
                  ...data,
                  agenda: data.agenda
                    .map((s: string) => s.trim())
                    .filter(Boolean),
                  speakers: data.speakers
                    .map((s: string) => s.trim())
                    .filter(Boolean),
                }
              : data,
          version: item?.version,
        },
      );
      saved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const field = (key: string, label: string, large = false, type = "text") => (
    <Field
      key={key}
      label={label}
      large={large}
      type={type}
      value={data[key] ?? ""}
      onChange={(v) => update(key, type === "number" ? Number(v) : v)}
    />
  );
  return (
    <section className="editor">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{names[kind]}</span>
          <h2>{item ? "İçeriği düzenle." : "Yeni bir içerik."}</h2>
        </div>
        <button className="secondary" onClick={close}>
          Listeye dön
        </button>
      </div>
      <form onSubmit={submit}>
        {kind === "team" ? (
          <>
            <label className="check">
              <input
                type="checkbox"
                checked={data.isExample}
                onChange={(e) => update("isExample", e.target.checked)}
              />
              Örnek ekip bilgisi (sitede taslak uyarısı göster)
            </label>
            <h3>Topluluk başkanı</h3>
            <MemberEditor
              member={data.president}
              change={(v) => update("president", v)}
            />
            <div className="subheading">
              <h3>Başkan yardımcıları</h3>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  update("vicePresidents", [
                    ...data.vicePresidents,
                    { name: "", role: "Başkan Yardımcısı" },
                  ])
                }
              >
                + Yardımcı ekle
              </button>
            </div>
            {data.vicePresidents.map((m: Member, i: number) => (
              <MemberEditor
                key={i}
                member={m}
                change={(v) =>
                  update(
                    "vicePresidents",
                    data.vicePresidents.map((x: Member, n: number) =>
                      n === i ? v : x,
                    ),
                  )
                }
                remove={() =>
                  update(
                    "vicePresidents",
                    data.vicePresidents.filter(
                      (_: unknown, n: number) => n !== i,
                    ),
                  )
                }
              />
            ))}
            <div className="subheading">
              <h3>Komiteler</h3>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  update("committees", [
                    ...data.committees,
                    {
                      name: "",
                      description: "",
                      members: [{ name: "", role: "Komite Başkanı" }],
                    },
                  ])
                }
              >
                + Komite ekle
              </button>
            </div>
            {data.committees.map((c: any, i: number) => {
              const change = (v: any) =>
                update(
                  "committees",
                  data.committees.map((x: any, n: number) => (n === i ? v : x)),
                );
              return (
                <section className="committee-editor" key={i}>
                  <div className="two-fields">
                    <Field
                      label="Komite adı"
                      value={c.name}
                      onChange={(name) => change({ ...c, name })}
                    />
                    <Field
                      label="Komite açıklaması"
                      value={c.description}
                      onChange={(description) => change({ ...c, description })}
                    />
                  </div>
                  {c.members.map((m: Member, j: number) => (
                    <MemberEditor
                      key={j}
                      member={m}
                      change={(v) =>
                        change({
                          ...c,
                          members: c.members.map((x: Member, n: number) =>
                            n === j ? v : x,
                          ),
                        })
                      }
                      remove={() =>
                        change({
                          ...c,
                          members: c.members.filter(
                            (_: unknown, n: number) => n !== j,
                          ),
                        })
                      }
                    />
                  ))}
                  <div className="actions">
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        change({
                          ...c,
                          members: [
                            ...c.members,
                            { name: "", role: "Komite Üyesi" },
                          ],
                        })
                      }
                    >
                      + Üye ekle
                    </button>
                    <button
                      type="button"
                      className="text-button danger"
                      onClick={() =>
                        update(
                          "committees",
                          data.committees.filter(
                            (_: unknown, n: number) => n !== i,
                          ),
                        )
                      }
                    >
                      Komiteyi kaldır
                    </button>
                  </div>
                </section>
              );
            })}
          </>
        ) : (
          <>
            <div className="editor-grid">
              <div>
                {field("title", "Başlık")}
                {kind === "events" &&
                  field("slug", "Sayfa kısa adı (örn. teknoloji-zirvesi)")}
                <div className="two-fields">
                  {field("category", "Kategori")}
                  {kind === "events" ? (
                    <label className="field">
                      <span>Durum</span>
                      <select
                        value={data.status}
                        onChange={(e) => update("status", e.target.value)}
                      >
                        <option value="completed">Tamamlandı</option>
                        <option value="upcoming">Yaklaşan</option>
                      </select>
                    </label>
                  ) : (
                    field("author", "Yazar")
                  )}
                </div>
                {field("description", "Açıklama", true)}
                {kind === "events" ? (
                  <>
                    {field("location", "Konum")}
                    <Field
                      label="Tarih ve saat (Türkiye)"
                      type="datetime-local"
                      value={
                        data.date
                          ? data.date.length === 10
                            ? data.date + "T00:00"
                            : new Date(Date.parse(data.date) + 10800000)
                                .toISOString()
                                .slice(0, 16)
                          : ""
                      }
                      onChange={(v) =>
                        update("date", v ? v + ":00+03:00" : undefined)
                      }
                    />
                    {field("source", "Duyuru / detay bağlantısı")}
                    <Field
                      label="Kayıt bağlantısı (isteğe bağlı)"
                      value={data.recording ?? ""}
                      onChange={(v) => update("recording", v || undefined)}
                    />
                    {["agenda", "speakers"].map((key) => (
                      <Field
                        key={key}
                        label={
                          key === "agenda"
                            ? "Program (her satıra bir madde)"
                            : "Konuşmacılar (her satıra bir kişi)"
                        }
                        large
                        value={data[key].join("\n")}
                        onChange={(v) => update(key, v.split("\n"))}
                      />
                    ))}
                    {field("imageAlt", "Görsel açıklaması")}
                  </>
                ) : (
                  <>
                    {field("published", "Yayın tarihi", false, "date")}
                    {field(
                      "readingMinutes",
                      "Okuma süresi (dakika)",
                      false,
                      "number",
                    )}
                    {field("href", "Medium yazısı bağlantısı")}
                  </>
                )}
              </div>
              <aside>
                <h3>
                  {kind === "events" ? "Etkinlik afişi" : "Kapak görseli"}
                </h3>
                <Media
                  value={data[kind === "events" ? "image" : "cover"]}
                  change={(url, width, height) => {
                    setData((old: any) => ({
                      ...old,
                      [kind === "events" ? "image" : "cover"]: url,
                      ...(kind === "events"
                        ? { imageWidth: width, imageHeight: height }
                        : {}),
                    }));
                  }}
                />
                {kind === "events" && (
                  <div className="two-fields">
                    {field("imageWidth", "Genişlik", false, "number")}
                    {field("imageHeight", "Yükseklik", false, "number")}
                  </div>
                )}
                <p className="hint">
                  Kaydettiğin değişiklikler taslakta tutulur. Liste üzerinden
                  yayınlayıp ardından siteye aktarabilirsin.
                </p>
              </aside>
            </div>
          </>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="save-bar">
          <span>Değişiklikler taslak olarak kaydedilecek.</span>
          <button disabled={busy}>
            {busy ? "Kaydediliyor…" : "Taslağı kaydet ↗"}
          </button>
        </div>
      </form>
    </section>
  );
}
