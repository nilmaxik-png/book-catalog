import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HabitsScreen from "./screens/HabitsScreen";
import AddHabitScreen from "./screens/AddHabitScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Habits" options={{ title: "Привычки" }}>
            {props => <HabitsScreen {...props} />}
          </Stack.Screen>
          <Stack.Screen name="AddHabit" options={{ title: "Добавление привычки" }}>
            {props => <AddHabitScreen {...props} onAdd={() => {}} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
