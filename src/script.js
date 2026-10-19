import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

const h = React.createElement;
const STATUSES = ["To Do", "In Progress", "Done"];

// Используем календарную дату браузера, без преобразования в UTC.
function getToday(date = new Date()) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function useToday() {
  const [today, setToday] = useState(getToday);
  useEffect(() => {
    const update = () => setToday(getToday());
    const timer = window.setInterval(update, 60000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, []);
  return today;
}

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

function formatDate(value) {
  return value.split("-").reverse().join(".");
}

function TaskList({ tasks, onStatusChange }) {
  return h("section", null,
    h("h2", null, "Список задач"),
    tasks.length === 0
      ? h("p", null, "Задач пока нет.")
      : h("div", { className: "table-wrap" },
          h("table", null,
            h("thead", null, h("tr", null,
              h("th", { scope: "col" }, "Название"),
              h("th", { scope: "col" }, "Дедлайн"),
              h("th", { scope: "col" }, "Статус")
            )),
            h("tbody", null, tasks.map(task => h("tr", { key: task.id },
              h("td", null, task.title),
              h("td", null, h("time", { dateTime: task.deadline }, formatDate(task.deadline))),
              h("td", null, h("select", {
                value: task.status,
                "aria-label": `Статус задачи: ${task.title}`,
                onChange: event => onStatusChange(task.id, event.target.value)
              }, STATUSES.map(status => h("option", { key: status, value: status }, status))))
            )))
          )
        )
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const today = useToday();

  function changeStatus(id, status) {
    if (!STATUSES.includes(status)) return;
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
  }

  function addTask(data) {
    const id = window.crypto?.randomUUID?.()
      || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setTasks(current => [...current, { id, ...data, status: STATUSES[0] }]);
  }

  return h("main", null,
    h("h1", null, "Менеджер задач"),
    h("p", { className: "current-date" }, "Текущая дата: ",
      h("time", { dateTime: today }, formatDate(today))),
    h(TaskForm, { onAdd: addTask }),
    h(TaskList, { tasks, onStatusChange: changeStatus })
  );
}

createRoot(document.getElementById("root")).render(h(App));
