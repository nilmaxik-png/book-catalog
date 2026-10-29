import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { formatSourceTime } from "../domain/traffic";
import { styles } from "../styles";

export default function RoadDetails({ segment, onClose }) {
  const seconds = Math.round(segment.travelSeconds);
  return (
    <ScrollView style={styles.details} contentContainerStyle={styles.detailsContent}>
      <View style={styles.detailsHeading}>
        <Text style={styles.detailsTitle}>Информация об участке</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Закрыть информацию об участке" hitSlop={8}>
          <Text style={styles.close}>Закрыть</Text>
        </Pressable>
      </View>
      <Text style={styles.roadName}>{segment.name}</Text>
      <View style={styles.statusLine}>
        <View style={[styles.dot, { backgroundColor: segment.level.color }]} />
        <Text style={styles.detailsText}>{segment.level.label} · {segment.borough}</Text>
      </View>
      <Text style={styles.detailsText}>
        Скорость: {segment.speedKmh.toFixed(1).replace(".", ",")} км/ч · Проезд: {Math.floor(seconds / 60)} мин {seconds % 60} с
      </Text>
      <Text style={styles.caption}>Время датчика: {formatSourceTime(segment.observedAt)}</Text>
    </ScrollView>
  );
}
