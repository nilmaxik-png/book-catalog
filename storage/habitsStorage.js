import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEY = "habit-tracker-v1";

export function decodeHabits(raw) {
  if (raw === null) return [];
  const data = JSON.parse(raw);
  if (!data || data.version !== 1 || !Array.isArray(data.habits)) {
    throw new Error("Некорректный формат сохранённых данных.");
  }
  const ids = new Set();
  for (const habit of data.habits) {
    if (!habit || typeof habit.id !== "string" || !habit.id || ids.has(habit.id)
        || typeof habit.name !== "string" || !habit.name.trim() || habit.name.length > 80
        || typeof habit.done !== "boolean") {
      throw new Error("Некорректная привычка в хранилище.");
    }
    ids.add(habit.id);
  }
  return data.habits;
}

export async function loadHabits() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return decodeHabits(raw);
}

export async function saveHabits(habits) {
  const raw = JSON.stringify({ version: 1, habits });
  await AsyncStorage.setItem(STORAGE_KEY, raw);
}
