import { Platform } from "react-native";
import { getCrewToken } from "./storage";

export function getApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (Platform.OS === "web") return "";
  return "";
}

export async function crewFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getCrewToken();
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(url, { ...options, headers });
}

export async function crewGet<T>(path: string): Promise<T> {
  const res = await crewFetch(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function crewPost<T>(path: string, body?: object): Promise<T> {
  const res = await crewFetch(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function crewPut<T>(path: string, body?: object): Promise<T> {
  const res = await crewFetch(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
