/**
 * Client API cu Token HMAC (12 ore) și gestionare automată a rate-limiting-ului.
 */

let inFlightTokenPromise: Promise<string> | null = null;

export async function getValidAccessToken(): Promise<string> {
  const cachedToken = sessionStorage.getItem("edumetodist_access_token");
  const cachedExp = Number(sessionStorage.getItem("edumetodist_token_exp") || 0);
  const now = Date.now();

  // Dacă avem un token valid pentru cel puțin încă 5 minute, îl folosim
  if (cachedToken && cachedExp > now + 5 * 60 * 1000) {
    return cachedToken;
  }

  // Evităm cererile paralele simultane pentru generarea tokenului
  if (inFlightTokenPromise) {
    return inFlightTokenPromise;
  }

  inFlightTokenPromise = (async () => {
    try {
      let resp = await fetch("/api/token", {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      let contentType = resp.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        // Fallback direct către ruta Netlify
        resp = await fetch("/.netlify/functions/token", {
          method: "GET",
          headers: { Accept: "application/json" },
        });
      }

      const data = await resp.json();
      if (data.success && data.token) {
        const expiresInMs = (data.expiresIn || 12 * 3600) * 1000;
        sessionStorage.setItem("edumetodist_access_token", data.token);
        sessionStorage.setItem("edumetodist_token_exp", String(Date.now() + expiresInMs));
        return data.token;
      }
      throw new Error(data.error || "Nu s-a putut obține tokenul de acces.");
    } finally {
      inFlightTokenPromise = null;
    }
  })();

  return inFlightTokenPromise;
}

export function clearAccessToken(): void {
  sessionStorage.removeItem("edumetodist_access_token");
  sessionStorage.removeItem("edumetodist_token_exp");
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getValidAccessToken();

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("x-access-token", token);

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Dacă primim 401 Unauthorized (token invalid/expirat), reîmprospătăm o singură dată
  if (response.status === 401) {
    clearAccessToken();
    const freshToken = await getValidAccessToken();
    headers.set("Authorization", `Bearer ${freshToken}`);
    headers.set("x-access-token", freshToken);

    response = await fetch(url, {
      ...options,
      headers,
    });
  }

  return response;
}
