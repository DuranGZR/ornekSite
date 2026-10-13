import React, { useState } from "react";
import QRCode from "qrcode";
import { api } from "./api";
import { Field } from "./Field";
export function Login({ done }: { done: () => void }) {
  const [stage, setStage] = useState("password"),
    [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [code, setCode] = useState(""),
    [qr, setQr] = useState(""),
    [secret, setSecret] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [codes, setCodes] = useState<string[]>([]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (stage === "password") {
        const r = await api("auth/password", "POST", { username, password });
        setPassword("");
        if (r.needsSetup) {
          const enrollment = await api("auth/enrollment");
          setSecret(enrollment.secret);
          setQr(await QRCode.toDataURL(enrollment.uri));
        }
        setStage("verify");
      } else {
        const r = await api("auth/verify", "POST", { code });
        setCode("");
        setSecret("");
        setQr("");
        if (r.recoveryCodes.length) {
          setCodes(r.recoveryCodes);
          setStage("recovery");
        } else done();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login">
      <section className="login-story">
        <a className="brand" href="/">
          &lt; HSD &gt;<small>İNÖNÜ</small>
        </a>
        <div>
          <h1>
            Birlikte ürettiğimiz
            <br />
            <em>her şey, burada.</em>
          </h1>
          <p>Topluluğun içeriklerini özenle yönet.</p>
        </div>
        <span className="login-foot">HSD İnönü · Yönetim alanı</span>
      </section>
      <section className="login-form">
        <div className="form-wrap">
          <span className="eyebrow">YÖNETİCİ GİRİŞİ</span>
          <h2>
            {stage === "password"
              ? "Hoş geldin."
              : stage === "recovery"
                ? "Kodlarını sakla."
                : "Bir adım kaldı."}
          </h2>
          <p>
            {stage === "password"
              ? "Devam etmek için hesabına giriş yap."
              : stage === "recovery"
                ? "Doğrulama uygulamana erişemediğinde bu tek kullanımlık kodlarla giriş yapabilirsin. Güvenli bir yerde sakla."
                : "Doğrulama uygulamasındaki altı haneli kodu gir."}
          </p>
          {stage === "recovery" ? (
            <>
              <div className="recovery">
                {codes.map((c) => (
                  <code key={c}>{c}</code>
                ))}
              </div>
              <button onClick={done}>Kodları sakladım, devam et ↗</button>
            </>
          ) : (
            <form onSubmit={submit}>
              {stage === "password" ? (
                <>
                  <Field
                    label="Kullanıcı adı"
                    value={username}
                    onChange={setUsername}
                  />
                  <label className="field">
                    <span>Parola</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </label>
                </>
              ) : (
                <>
                  {qr && (
                    <div className="enroll">
                      <img
                        src={qr}
                        alt="Doğrulama uygulamasında taranacak QR kod"
                      />
                      <p>
                        Authenticator uygulamasında tara veya anahtarı ekle:
                      </p>
                      <code>{secret}</code>
                    </div>
                  )}
                  <label className="field">
                    <span>Doğrulama veya kurtarma kodu</span>
                    <input
                      autoComplete="one-time-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      maxLength={32}
                    />
                  </label>
                </>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button disabled={busy}>
                {busy
                  ? "Kontrol ediliyor…"
                  : stage === "password"
                    ? "Devam et ↗"
                    : "Güvenli giriş ↗"}
              </button>
              {stage === "verify" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setStage("password");
                    setSecret("");
                    setQr("");
                  }}
                >
                  Girişe dön
                </button>
              )}
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
