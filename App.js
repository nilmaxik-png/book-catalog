import React, { useState } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import TrafficMap from "./components/TrafficMap";
import RoadDetails from "./components/RoadDetails";
import { TRAFFIC_LEVELS, formatReceivedTime } from "./domain/traffic";
import { useTraffic } from "./hooks/useTraffic";
import { styles } from "./styles";

export default function App() {
  const { segments, snapshot, loading, error, refresh } = useTraffic();
  const [selectedId, setSelectedId] = useState(null);
  const selected = segments.find(segment => segment.id === selectedId);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.title}>Карта дорожной обстановки</Text>
          <Text style={styles.subtitle}>Москва · дорожная обстановка</Text>
          <View style={styles.actions}>
            <Button title={loading ? "Обновление..." : "Обновить данные"} onPress={refresh} disabled={loading} />
            <Text style={styles.count} accessibilityLiveRegion="polite">Участков: {segments.length}</Text>
          </View>
          <View style={styles.legend}>
            {Object.values(TRAFFIC_LEVELS).map(level => (
              <View style={styles.legendItem} key={level.key}>
                <View style={styles.legendHeading}>
                  <View style={[styles.dot, { backgroundColor: level.color }]} />
                  <Text style={styles.legendLabel}>{level.label}</Text>
                </View>
                <Text style={styles.range}>{level.range}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.caption}>Цвет — оценка по времени проезда с учётом пробок.</Text>
          {snapshot ? (
            <Text style={styles.caption}>
              Получено: {formatReceivedTime(snapshot.receivedAt)} МСК
            </Text>
          ) : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>
            {error}{segments.length ? " На карте оставлены ранее полученные данные." : ""}
          </Text> : null}
          <View style={styles.mapFrame}>
            <TrafficMap segments={segments} selectedId={selectedId} onSelect={setSelectedId} />
            {loading && !segments.length ? <View style={styles.loading}>
              <ActivityIndicator size="large" />
              <Text style={styles.caption}>Получаем данные по Москве...</Text>
            </View> : null}
          </View>
          {selected ? <RoadDetails segment={selected} onClose={() => setSelectedId(null)} /> : (
            <Text style={styles.caption}>Нажмите на цветной маркер, чтобы увидеть информацию об участке.</Text>
          )}
          <Text style={styles.footer}>Дорожные данные: «Квазар» / 1traffic.ru · Карта: OpenStreetMap</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
