import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const CREW_TOKEN_KEY = "certxa_crew_token";
const CREW_DATA_KEY = "certxa_crew_data";

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveCrewToken(token: string) {
  await setItem(CREW_TOKEN_KEY, token);
}

export async function getCrewToken(): Promise<string | null> {
  return getItem(CREW_TOKEN_KEY);
}

export async function clearCrewToken() {
  await removeItem(CREW_TOKEN_KEY);
}

export async function saveCrewData(data: object) {
  await setItem(CREW_DATA_KEY, JSON.stringify(data));
}

export async function getCrewData(): Promise<object | null> {
  const raw = await getItem(CREW_DATA_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearCrewData() {
  await removeItem(CREW_DATA_KEY);
}
