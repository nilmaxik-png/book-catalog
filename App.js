import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HabitsScreen from "./screens/HabitsScreen";
import AddHabitScreen from "./screens/AddHabitScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [habits, setHabits] = useState([]);

  function toggleHabit(id) {
    setHabits(current => current.map(habit => habit.id === id ? { ...habit, done: !habit.done } : habit));
  }

  function addHabit(name) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setHabits(current => [...current, { id, name, done: false }]);
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Habits" options={{ title: "Привычки" }}>
            {props => <HabitsScreen {...props} habits={habits} onToggle={toggleHabit} />}
          </Stack.Screen>
          <Stack.Screen name="AddHabit" options={{ title: "Добавление привычки" }}>
            {props => <AddHabitScreen {...props} onAdd={addHabit} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
