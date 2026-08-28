import type { ApiEnvelope } from "@dialogue-room/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
  status: number;
  envelopeStatus: ApiEnvelope["status"];

  constructor(message: string, status: number, envelopeStatus: ApiEnvelope["status"]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.envelopeStatus = envelopeStatus;
  }
}

type Json = Record<string, unknown> | unknown[];

interface RequestOptions {
  /** Query string params, appended to the URL. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Skip the automatic 401 refresh-and-retry (used by the refresh call itself). */
  skipAuthRetry?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(
    path.startsWith("http") ? path : `${API_URL}${path.startsWith("/") ? path : `/${path}`}`,
  );
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

const PROTECTED_PREFIXES = ["/home", "/search", "/friends", "/chat", "/profile", "/onboarding"];

/**
 * Hard-redirect to /login, but only from protected app routes. On public and
 * auth pages an expired/absent session is a normal state — redirecting there
 * caused a reload loop (/ → 401 → /login → 401 → …).
 */
function redirectToLogin() {
  if (typeof window === "undefined") return;
  const pathname = window.location.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isProtected) {
    window.location.href = "/login";
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: Json | FormData,
  options: RequestOptions = {},
): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = {};
  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const doFetch = () =>
    fetch(buildUrl(path, options.params), {
      method,
      credentials: "include",
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });

  let res = await doFetch();

  if (res.status === 401 && !options.skipAuthRetry && path !== "/auth/refresh") {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await doFetch();
    } else {
      redirectToLogin();
      throw new ApiError("Session expired", 401, "fail");
    }
  }

  let envelope: ApiEnvelope<T> | undefined;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    envelope = undefined;
  }

  if (!res.ok || envelope?.status === "fail" || envelope?.status === "error") {
    const message = envelope?.message ?? res.statusText ?? "Request failed";
    if (res.status === 401 && !options.skipAuthRetry) {
      redirectToLogin();
    }
    throw new ApiError(message, res.status, envelope?.status ?? "error");
  }

  return envelope?.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: Json | FormData, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: Json | FormData, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
