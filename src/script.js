import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const h = React.createElement;

function isValidDeadline(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(`${value}T00:00:00`);
  return year > 0 && date.getFullYear() === year
    && date.getMonth() + 1 === month && date.getDate() === day;
}

function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const cleanedTitle = title.trim();
    if (!cleanedTitle || cleanedTitle.length > 120) {
      setError("Введите название задачи от 1 до 120 символов.");
      return;
    }
    if (!isValidDeadline(deadline)) {
      setError("Укажите корректную дату дедлайна.");
      return;
    }
    onAdd({ title: cleanedTitle, deadline });
    setTitle("");
    setDeadline("");
    setError("");
  }

  return h("section", null,
    h("h2", null, "Добавить задачу"),
    h("form", { onSubmit: submit, noValidate: true },
      h("div", { className: "field" },
        h("label", { htmlFor: "title" }, "Название:"),
        h("input", { id: "title", type: "text", value: title, maxLength: 120,
          placeholder: "Например: подготовить отчёт", required: true,
          onChange: event => setTitle(event.target.value) })
      ),
      h("div", { className: "field" },
        h("label", { htmlFor: "deadline" }, "Дедлайн:"),
        h("input", { id: "deadline", type: "date", value: deadline, required: true,
          max: "9999-12-31", "aria-describedby": "deadlineHint",
          onChange: event => setDeadline(event.target.value) }),
        h("p", { id: "deadlineHint" }, "Задачу можно выполнить до конца выбранного дня.")
      ),
      error && h("p", { className: "error", role: "alert" }, error),
      h("button", { type: "submit" }, "Добавить")
    )
  );
}

function App() {
  return h("main", null,
    h("h1", null, "Менеджер задач"),
    h(TaskForm, { onAdd: () => {} })
  );
}

createRoot(document.getElementById("root")).render(h(App));
