import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { NEW_YORK_REGION } from "../domain/mapRegion";

export default function TrafficMap({ segments, onSelect }) {
  return (
    <MapView style={StyleSheet.absoluteFillObject} initialRegion={NEW_YORK_REGION}
      accessibilityLabel="Карта дорожной обстановки Нью-Йорка">
      {segments.map(segment => (
        <Marker key={segment.id} identifier={segment.id} coordinate={segment.position}
          title={segment.name} pinColor={segment.level.color}
          description={`${segment.level.label}: ${segment.speedKmh.toFixed(1)} км/ч`}
          onPress={() => onSelect(segment.id)} />
      ))}
    </MapView>
  );
}
