import { useState, useEffect, useRef } from "react";
import { loadHabits, saveHabits } from "../storage/habitsStorage";

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveAttempt, setSaveAttempt] = useState(0);
  const nextId = useRef(0);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    setIsLoaded(false);
    setLoadError("");
    loadHabits().then(saved => {
      if (!active) return;
      setHabits(saved);
      setIsLoaded(true);
    }).catch(() => {
      if (active) setLoadError("Не удалось загрузить привычки. Повторите загрузку.");
    });
    return () => { active = false; };
  }, [loadAttempt]);

  useEffect(() => {
    // Пока чтение не закончено, не записываем пустой начальный массив.
    if (!isLoaded) return;
    let active = true;
    setIsSaving(true);
    setSaveError("");

    // Снимки записываются по очереди, даже при быстрых переключениях.
    const write = saveQueue.current.catch(() => {}).then(() => saveHabits(habits));
    saveQueue.current = write;
    write.then(() => {
      if (active) setIsSaving(false);
    }).catch(() => {
      if (!active) return;
      setIsSaving(false);
      setSaveError("Не удалось сохранить изменения. Нажмите «Повторить сохранение».");
    });
    return () => { active = false; };
  }, [habits, isLoaded, saveAttempt]);

  function addHabit(value) {
    const name = value.trim();
    if (!isLoaded || !name || name.length > 80) return false;
    nextId.current += 1;
    const id = `${Date.now()}-${nextId.current}-${Math.random().toString(36).slice(2)}`;
    setHabits(current => [...current, { id, name, done: false }]);
    return true;
  }

  function toggleHabit(id) {
    if (!isLoaded) return;
    setHabits(current => current.map(habit => habit.id === id ? { ...habit, done: !habit.done } : habit));
  }

  function removeHabit(id) {
    if (!isLoaded) return;
    setHabits(current => current.filter(habit => habit.id !== id));
  }

  return {
    habits, isLoaded, loadError, saveError, isSaving, addHabit, toggleHabit, removeHabit,
    retryLoad: () => setLoadAttempt(current => current + 1),
    retrySave: () => setSaveAttempt(current => current + 1)
  };
}
