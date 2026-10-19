import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HabitsScreen from "./screens/HabitsScreen";
import AddHabitScreen from "./screens/AddHabitScreen";
import { useHabits } from "./hooks/useHabits";

const Stack = createNativeStackNavigator();

export default function App() {
  const data = useHabits();

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Habits" options={{ title: "Привычки" }}>
            {props => (
              <HabitsScreen
                {...props}
                habits={data.habits}
                onToggle={data.toggleHabit}
                isLoaded={data.isLoaded}
                loadError={data.loadError}
                saveError={data.saveError}
                isSaving={data.isSaving}
                onRetryLoad={data.retryLoad}
                onRetrySave={data.retrySave}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AddHabit" options={{ title: "Добавление привычки" }}>
            {props => <AddHabitScreen {...props} onAdd={data.addHabit} isLoaded={data.isLoaded} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
