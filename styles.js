import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "white" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  text: { fontSize: 16, marginBottom: 12 },
  label: { fontSize: 16, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#888", padding: 10, fontSize: 16, marginBottom: 12 },
  error: { color: "#a00000", fontSize: 15, marginBottom: 12 },
  habit: { padding: 12, borderWidth: 1, borderColor: "#aaa", marginTop: 12 },
  habitTitle: { fontSize: 18, marginBottom: 8 },
  doneTitle: { color: "#555", textDecorationLine: "line-through" },
  actions: { marginTop: 12 },
  status: { color: "#555", fontSize: 14, marginTop: 12 },
  list: { marginTop: 12 },
  listContent: { paddingBottom: 24 }
});
