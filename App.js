import React from "react";
import { View, Text } from "react-native";
import { styles } from "./styles";

export default function App() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Трекер привычек</Text>
    </View>
  );
}
