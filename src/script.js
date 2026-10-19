import React from "react";
import { createRoot } from "react-dom/client";

const h = React.createElement;

function App() {
  return h("main", null, h("h1", null, "Учёт личных финансов"));
}

createRoot(document.getElementById("root")).render(h(App));
