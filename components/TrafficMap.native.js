import React, { useEffect, useRef, useState } from "react";
import { Button, Linking, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { MAP_HTML } from "../map/mapDocument";

const source = { html: MAP_HTML };
const channel = "moscow-traffic-map";
const userAgentName = "MoscowTrafficPractice/1.1 (+https://github.com/nilmaxik-png/book-catalog)";

export default function TrafficMap({ segments, selectedId, onSelect }) {
  const webView = useRef(null);
  const ready = useRef(false);
  const latest = useRef({ segments, selectedId, onSelect });
  const [failed, setFailed] = useState(false);
  latest.current = { segments, selectedId, onSelect };

  function update() {
    if (!ready.current) return;
    const { segments: current, selectedId: selected } = latest.current;
    webView.current?.injectJavaScript(`window.setTrafficData(${JSON.stringify({ segments: current, selectedId: selected })});true;`);
  }
  useEffect(update, [segments, selectedId]);

  return <View style={styles.container}>
    <WebView ref={webView} source={source} style={styles.webview}
      originWhitelist={["*"]} javaScriptEnabled domStorageEnabled
      applicationNameForUserAgent={userAgentName}
      accessibilityLabel="Карта дорожной обстановки Москвы"
      onLoadStart={() => { ready.current = false; }}
      onMessage={({ nativeEvent }) => {
        let message;
        try { message = JSON.parse(nativeEvent.data); } catch { return; }
        if (message?.channel !== channel) return;
        if (message.type === "ready") { ready.current = true; setFailed(false); update(); }
        if (message.type === "select" && latest.current.segments.some(road => road.id === message.id)) {
          latest.current.onSelect(message.id);
        }
      }}
      onShouldStartLoadWithRequest={({ url }) => {
        if (url === "about:blank" || url.startsWith("data:text/html")) return true;
        if (url.startsWith("https://www.openstreetmap.org/")) Linking.openURL(url).catch(() => {});
        return false;
      }}
      onError={() => setFailed(true)}
      onRenderProcessGone={() => { ready.current = false; setFailed(true); }}
    />
    {failed ? <View style={styles.error}>
      <Text style={styles.message}>Не удалось открыть карту.</Text>
      <Button title="Повторить загрузку карты" onPress={() => { setFailed(false); webView.current?.reload(); }} />
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: "#e5e7eb" },
  webview: { flex: 1, backgroundColor: "#e5e7eb" },
  error: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff" },
  message: { color: "#a00000", fontSize: 14 }
});
