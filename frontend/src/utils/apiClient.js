const API_PATH_PREFIXES = ["/auth", "/student-api", "/instructor-api", "/admin-api", "/uploads"];

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || "";

  return configuredUrl.replace(/\/$/, "");
}

function shouldUseApiBase(input) {
  if (typeof input !== "string") return false;
  return API_PATH_PREFIXES.some((prefix) => input === prefix || input.startsWith(`${prefix}/`));
}

export function installApiClient() {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl || window.__ATP_API_CLIENT_INSTALLED__) return;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (shouldUseApiBase(input)) {
      return nativeFetch(`${apiBaseUrl}${input}`, init);
    }

    if (input instanceof Request && shouldUseApiBase(new URL(input.url).pathname)) {
      const url = new URL(input.url);
      const nextRequest = new Request(`${apiBaseUrl}${url.pathname}${url.search}`, input);
      return nativeFetch(nextRequest, init);
    }

    return nativeFetch(input, init);
  };

  window.__ATP_API_CLIENT_INSTALLED__ = true;
}

export function getAssetUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http") || url.startsWith("data:") || !url.startsWith("/uploads")) return url;

  const apiBaseUrl = getApiBaseUrl();
  return apiBaseUrl ? `${apiBaseUrl}${url}` : url;
}
