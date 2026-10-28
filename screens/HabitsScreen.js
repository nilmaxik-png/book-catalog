import React from "react";
import { View, Text, Button, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export default function HabitsScreen({ navigation, habits = [], onToggle, onRemove,
  isLoaded, loadError, saveError, isSaving, onRetryLoad, onRetrySave }) {
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
        <Text style={styles.title}>Список привычек</Text>
        {loadError ? (
          <View>
            <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text>
            <Button title="Повторить загрузку" onPress={onRetryLoad} />
          </View>
        ) : <Text style={styles.text}>Загрузка привычек...</Text>}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <Text style={styles.title}>Список привычек</Text>
      <Text style={styles.text}>Выполнено: {habits.filter(habit => habit.done).length} из {habits.length}</Text>
      <Button title="Добавить привычку" onPress={() => navigation.navigate("AddHabit")} />
      <Text accessibilityLiveRegion="polite" style={styles.status}>
        {saveError ? "Последние изменения не сохранены." : isSaving ? "Сохранение..." : "Данные сохранены на устройстве."}
      </Text>
      {saveError ? (
        <View style={styles.actions}>
          <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text>
          <Button title="Повторить сохранение" onPress={onRetrySave} />
        </View>
      ) : null}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={habits}
        keyExtractor={habit => habit.id}
        ListEmptyComponent={<Text style={styles.text}>Привычек пока нет.</Text>}
        renderItem={({ item }) => (
          <View style={styles.habit}>
            <Text style={[styles.habitTitle, item.done && styles.doneTitle]}>{item.name}</Text>
            <Text style={styles.text}>{item.done ? "Выполнено" : "Не выполнено"}</Text>
            <Button
              title={item.done ? "Отменить выполнение" : "Отметить выполненной"}
              accessibilityLabel={`Изменить выполнение: ${item.name}`}
              onPress={() => onToggle(item.id)}
            />
            <View style={styles.actions}>
              <Button
                title="Удалить"
                color="#b00000"
                accessibilityLabel={`Удалить привычку: ${item.name}`}
                onPress={() => onRemove(item.id)}
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
