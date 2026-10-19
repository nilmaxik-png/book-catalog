import React from "react";
import { View, Text, Button, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export default function HabitsScreen({ navigation, habits = [] }) {
  return (
    <SafeAreaView style={styles.screen} edges={["bottom", "left", "right"]}>
      <Text style={styles.title}>Список привычек</Text>
      <Button title="Добавить привычку" onPress={() => navigation.navigate("AddHabit")} />
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={habits}
        keyExtractor={habit => habit.id}
        ListEmptyComponent={<Text style={styles.text}>Привычек пока нет.</Text>}
        renderItem={({ item }) => (
          <View style={styles.habit}>
            <Text style={styles.habitTitle}>{item.name}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
