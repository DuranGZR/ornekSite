export let csrf = "";
export const setCsrf = (value: string) => {
  csrf = value;
};
export async function api(path: string, method = "GET", data?: unknown) {
  const form = data instanceof FormData;
  const response = await fetch("/api/" + path, {
    method,
    credentials: "same-origin",
    headers: {
      ...(form ? {} : { "Content-Type": "application/json" }),
      ...(method !== "GET" ? { "X-CSRF-Token": csrf } : {}),
    },
    body: data === undefined ? undefined : form ? data : JSON.stringify(data),
  });
  const result = await response
    .json()
    .catch(() => ({ message: "Sunucuya ulaşılamadı." }));
  if (!response.ok) {
    if (response.status === 401 && csrf) {
      setCsrf("");
      window.dispatchEvent(new Event("session-expired"));
    }
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : "İşlem tamamlanamadı.",
    );
  }
  return result;
}
