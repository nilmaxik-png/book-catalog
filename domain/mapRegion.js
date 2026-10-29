export const MOSCOW_REGION = {
  latitude: 55.7558, longitude: 37.6173, zoom: 11,
  latitudeDelta: 0.2, longitudeDelta: 0.3
};

// Короткие маршруты для сравнения дорожной обстановки в разных частях Москвы.
// Положение маркера задано заранее; время и длина пути приходят из API.
export const MOSCOW_ROADS = [
  { id: "tverskaya", name: "Тверская улица", start: [55.7657, 37.6060], end: [55.7580, 37.6115] },
  { id: "novy-arbat", name: "Новый Арбат", start: [55.7523, 37.5803], end: [55.7525, 37.5970] },
  { id: "sadovoe", name: "Садовое кольцо · Земляной Вал", start: [55.7484, 37.6633], end: [55.7563, 37.6596] },
  { id: "kutuzovsky", name: "Кутузовский проспект", start: [55.7419, 37.5280], end: [55.7447, 37.5532] },
  { id: "mira", name: "Проспект Мира", start: [55.7894, 37.6344], end: [55.7995, 37.6397] },
  { id: "leningradsky", name: "Ленинградский проспект", start: [55.7920, 37.5579], end: [55.8053, 37.5359] },
  { id: "leninsky", name: "Ленинский проспект", start: [55.7058, 37.5785], end: [55.7188, 37.5873] },
  { id: "varshavskoe", name: "Варшавское шоссе", start: [55.6678, 37.6231], end: [55.6829, 37.6228] }
].map(road => ({ ...road, position: {
  latitude: (road.start[0] + road.end[0]) / 2,
  longitude: (road.start[1] + road.end[1]) / 2
} }));
