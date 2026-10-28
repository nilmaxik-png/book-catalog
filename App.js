import React from "react";
import { Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24 }}>Карта дорожной обстановки</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
