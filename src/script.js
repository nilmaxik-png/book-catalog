import React from "react";
import { createRoot } from "react-dom/client";

const h = React.createElement;

function App() {
  return h("main", null, h("h1", null, "Менеджер задач"));
}

createRoot(document.getElementById("root")).render(h(App));
