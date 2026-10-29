(function () {
  "use strict";
  var channel = "moscow-traffic-map";
  var map = L.map("map").setView([55.7558, 37.6173], 11);
  var markers = L.layerGroup().addTo(map);
  var fitted = false;
  var failedTiles = new Set();
  var notice = document.getElementById("tile-notice");
  var tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    keepBuffer: 1,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  function updateNotice() {
    notice.hidden = failedTiles.size === 0;
  }
  tiles.on("tileerror", function (event) {
    failedTiles.add(event.tile.src);
    updateNotice();
  });
  tiles.on("tileload tileunload", function (event) {
    failedTiles.delete(event.tile.src);
    updateNotice();
  });
  document.getElementById("retry-tiles").onclick = function () {
    failedTiles.clear();
    updateNotice();
    tiles.redraw();
  };

  function send(type, value) {
    var message = { channel: channel, type: type, id: value };
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
    else window.parent.postMessage(message, "*");
  }

  window.setTrafficData = function (payload) {
    if (!payload || !Array.isArray(payload.segments)) return;
    markers.clearLayers();
    var bounds = [];
    payload.segments.forEach(function (segment) {
      if (!segment.position || !Number.isFinite(segment.position.latitude)
          || !Number.isFinite(segment.position.longitude) || !segment.level) return;
      var point = document.createElement("span");
      point.className = "traffic-dot" + (payload.selectedId === segment.id ? " traffic-dot-selected" : "");
      if (/^#[0-9a-f]{6}$/i.test(segment.level.color)) point.style.backgroundColor = segment.level.color;
      var icon = L.divIcon({ html: point, className: "traffic-marker", iconSize: [26, 26], iconAnchor: [13, 13] });
      var coordinate = [segment.position.latitude, segment.position.longitude];
      L.marker(coordinate, { icon: icon, keyboard: true, title: segment.name + ": " + segment.level.label })
        .on("click", function () { send("select", segment.id); }).addTo(markers);
      bounds.push(coordinate);
    });
    if (bounds.length && !fitted) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 });
      fitted = true;
    }
  };

  window.addEventListener("message", function (event) {
    if (event.source !== window.parent) return;
    var message = event.data;
    if (message && message.channel === channel && message.type === "update") window.setTrafficData(message);
  });
  window.addEventListener("resize", function () { map.invalidateSize(); });
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(function () { map.invalidateSize(); }).observe(document.body);
  send("ready");
})();
