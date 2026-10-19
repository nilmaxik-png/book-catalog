import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export default function AddHabitScreen({ navigation, onAdd }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const cleanedName = name.trim();
    if (!cleanedName || cleanedName.length > 80) {
      setError("Введите название от 1 до 80 символов.");
      return;
    }
    onAdd(cleanedName);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <Text style={styles.title}>Новая привычка</Text>
      <Text nativeID="habitNameLabel" style={styles.label}>Название:</Text>
      <TextInput
        style={styles.input}
        accessibilityLabel="Название привычки"
        value={name}
        onChangeText={setName}
        maxLength={80}
        placeholder="Например: читать 20 минут"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Button title="Добавить" onPress={submit} />
      <View style={styles.actions}>
        <Button title="Отмена" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}
