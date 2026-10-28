import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, width: "100%", maxWidth: 1100, alignSelf: "center", padding: 12, gap: 8 },
  title: { color: "#111827", fontSize: 22, fontWeight: "bold" },
  subtitle: { color: "#4b5563", fontSize: 14 },
  actions: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 },
  count: { color: "#374151", fontSize: 14 },
  legend: { flexDirection: "row", gap: 8 },
  legendItem: { flex: 1, padding: 7, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 6 },
  legendHeading: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, color: "#111827", fontSize: 12, fontWeight: "600" },
  range: { color: "#4b5563", fontSize: 11, marginTop: 4 },
  caption: { color: "#4b5563", fontSize: 12 },
  error: { color: "#a00000", fontSize: 13 },
  mapFrame: { flex: 1, minHeight: 220, position: "relative", borderWidth: 1, borderColor: "#9ca3af", borderRadius: 6, overflow: "hidden" },
  loading: { ...StyleSheet.absoluteFillObject, backgroundColor: "#ffffffdd", justifyContent: "center", alignItems: "center", gap: 10 },
  footer: { color: "#6b7280", fontSize: 11 },
  details: { maxHeight: 180, flexGrow: 0, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, backgroundColor: "#f9fafb" },
  detailsContent: { padding: 10, gap: 5 },
  detailsHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  detailsTitle: { fontSize: 14, fontWeight: "bold", color: "#111827" },
  close: { color: "#1d4ed8", fontSize: 13, paddingVertical: 3 },
  roadName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  detailsText: { fontSize: 13, color: "#111827" },
  statusLine: { flexDirection: "row", alignItems: "center", gap: 6 }
});
