import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, Linking, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { MAP_HTML } from "../map/mapDocument";

const source = { html: MAP_HTML };
const channel = "moscow-traffic-map";
const userAgentName = "MoscowTrafficPractice/1.2 (+https://github.com/nilmaxik-png/book-catalog)";

export default function TrafficMap({ segments, selectedId, onSelect }) {
  const webView = useRef(null);
  const ready = useRef(false);
  const timer = useRef(null);
  const latest = useRef({ segments, selectedId, onSelect });
  const [size, setSize] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  latest.current = { segments, selectedId, onSelect };

  function stopTimer() {
    clearTimeout(timer.current);
    timer.current = null;
  }
  function fail(message) {
    stopTimer();
    ready.current = false;
    setLoading(false);
    setError(message);
  }
  function begin() {
    stopTimer();
    ready.current = false;
    setLoading(true);
    setError("");
    timer.current = setTimeout(() => fail("Карта не запустилась. Нажмите «Повторить загрузку карты»."), 12000);
  }
  function update() {
    if (!ready.current) return;
    const { segments: current, selectedId: selected } = latest.current;
    webView.current?.injectJavaScript(`window.setTrafficData(${JSON.stringify({ segments: current, selectedId: selected })});true;`);
  }
  function acceptReady() {
    stopTimer();
    ready.current = true;
    setLoading(false);
    setError("");
    update();
  }
  useEffect(update, [segments, selectedId]);
  const measured = size !== null;
  useEffect(() => {
    // A native load event may never arrive when WebView startup itself fails.
    if (measured && !ready.current && !timer.current) {
      timer.current = setTimeout(() => fail("Карта не запустилась. Нажмите «Повторить загрузку карты»."), 12000);
    }
    return stopTimer;
  }, [measured, attempt]);

  return <View style={styles.container} collapsable={false} onLayout={({ nativeEvent }) => {
    const { width, height } = nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    setSize(previous => previous?.width === width && previous?.height === height ? previous : { width, height });
  }}>
    {size ? <WebView key={attempt} ref={webView} source={source}
      // Mount after measurement and size both the native view and its wrapper.
      // This avoids relying on nested flex layout inside an absolute Android view.
      style={[styles.webview, size]} containerStyle={[styles.webview, size]}
      originWhitelist={["*"]} javaScriptEnabled domStorageEnabled
      androidLayerType="software" scalesPageToFit={false}
      scrollEnabled={false} setBuiltInZoomControls={false}
      applicationNameForUserAgent={userAgentName}
      accessibilityLabel="Карта дорожной обстановки Москвы"
      onLoadStart={begin}
      onLoadEnd={() => {
        // The native message bridge can become ready after the inline page script.
        // Ask again after load, rather than depending on one startup message.
        webView.current?.injectJavaScript(`(function(){
          var bridge=window.ReactNativeWebView;
          if(!bridge)return;
          var ok=typeof window.setTrafficData==='function';
          bridge.postMessage(JSON.stringify({channel:${JSON.stringify(channel)},type:ok?'ready':'error',message:'Не удалось запустить содержимое карты.'}));
          if(ok)window.dispatchEvent(new Event('resize'));
        })();true;`);
      }}
      onMessage={({ nativeEvent }) => {
        let message;
        try { message = JSON.parse(nativeEvent.data); } catch { return; }
        if (message?.channel !== channel) return;
        if (message.type === "ready") acceptReady();
        if (message.type === "error") fail(message.message || "Не удалось открыть карту.");
        if (message.type === "select" && latest.current.segments.some(road => road.id === message.id)) {
          latest.current.onSelect(message.id);
        }
      }}
      onShouldStartLoadWithRequest={({ url }) => {
        if (!url || url === "about:blank" || url.startsWith("about:blank#") || url.startsWith("data:text/html")) return true;
        if (url.startsWith("https://www.openstreetmap.org/")) Linking.openURL(url).catch(() => {});
        return false;
      }}
      onError={({ nativeEvent }) => fail(nativeEvent.description || "Не удалось открыть карту.")}
      onRenderProcessGone={() => fail("Android остановил экран карты. Повторите загрузку.")}
    /> : null}
    {loading && !error ? <View style={styles.overlay} pointerEvents="none">
      <ActivityIndicator size="large" />
      <Text style={styles.message}>Открываем карту Москвы...</Text>
    </View> : null}
    {error ? <View style={styles.overlay}>
      <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
      <Button title="Повторить загрузку карты" onPress={() => {
        begin();
        // Reloading about:blank can lose inline HTML; a fresh view receives it again.
        setAttempt(value => value + 1);
      }} />
    </View> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, flex: 1, backgroundColor: "#e5e7eb" },
  webview: { flex: 0, backgroundColor: "#e5e7eb" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", gap: 12, padding: 16, backgroundColor: "#fff" },
  message: { color: "#374151", fontSize: 14, textAlign: "center" },
  error: { color: "#a00000", fontSize: 14, textAlign: "center" }
});
