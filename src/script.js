import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const h = React.createElement;

// Храним деньги в копейках: 0,10 + 0,20 даст ровно 0,30.
function parseAmount(text) {
  const value = text.trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return null;
  const [rubles, kopecks = ""] = value.replace(",", ".").split(".");
  const cents = Number(rubles) * 100 + Number(kopecks.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

function OperationForm({ onAdd }) {
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const cleanedCategory = category.trim();
    if (!cleanedCategory || cleanedCategory.length > 80) {
      setError("Введите категорию от 1 до 80 символов.");
      return;
    }
    const amountCents = parseAmount(amount);
    if (amountCents === null) {
      setError("Введите положительную сумму с точкой или запятой, не более двух знаков после неё.");
      return;
    }
    const message = onAdd({ type, category: cleanedCategory, amountCents });
    if (message) {
      setError(message);
      return;
    }
    setCategory("");
    setAmount("");
    setError("");
  }

  return h("section", null,
    h("h2", null, "Добавить операцию"),
    h("form", { onSubmit: submit, noValidate: true },
      h("div", { className: "field" },
        h("label", { htmlFor: "type" }, "Тип:"),
        h("select", { id: "type", value: type, onChange: event => setType(event.target.value) },
          h("option", { value: "income" }, "Доход"),
          h("option", { value: "expense" }, "Расход")
        )
      ),
      h("div", { className: "field" },
        h("label", { htmlFor: "category" }, "Категория:"),
        h("input", { id: "category", type: "text", value: category, maxLength: 80,
          placeholder: "Например: зарплата или продукты", required: true,
          onChange: event => setCategory(event.target.value) })
      ),
      h("div", { className: "field" },
        h("label", { htmlFor: "amount" }, "Сумма, руб.:"),
        h("input", { id: "amount", type: "text", inputMode: "decimal", value: amount,
          placeholder: "Например: 1250,50", required: true,
          onChange: event => setAmount(event.target.value) })
      ),
      error && h("p", { className: "error", role: "alert" }, error),
      h("button", { type: "submit" }, "Добавить")
    )
  );
}

function formatMoney(cents) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency", currency: "RUB"
  }).format(cents / 100);
}

function OperationsList({ operations }) {
  return h("section", null,
    h("h2", null, "Список операций"),
    h("p", null, `Всего операций: ${operations.length}`),
    operations.length === 0
      ? h("p", null, "Операций пока нет.")
      : h("div", { className: "table-wrap" },
          h("table", null,
            h("thead", null, h("tr", null,
              h("th", { scope: "col" }, "Тип"),
              h("th", { scope: "col" }, "Категория"),
              h("th", { scope: "col" }, "Сумма")
            )),
            h("tbody", null, operations.map(operation => h("tr", { key: operation.id },
              h("td", null, operation.type === "income" ? "Доход" : "Расход"),
              h("td", null, operation.category),
              h("td", null, formatMoney(operation.amountCents))
            )))
          )
        )
  );
}

function Totals({ operations }) {
  let income = 0;
  let expense = 0;
  for (const operation of operations) {
    if (operation.type === "income") income += operation.amountCents;
    else expense += operation.amountCents;
  }
  return h("section", { "aria-live": "polite" },
    h("h2", null, "Итоги"),
    h("dl", { className: "totals" },
      h("dt", null, "Общий доход:"), h("dd", { id: "totalIncome" }, formatMoney(income)),
      h("dt", null, "Общий расход:"), h("dd", { id: "totalExpense" }, formatMoney(expense)),
      h("dt", null, "Баланс:"), h("dd", { id: "balance" }, formatMoney(income - expense))
    )
  );
}

function App() {
  const [operations, setOperations] = useState([]);

  function addOperation(data) {
    const totalCents = operations.reduce((sum, operation) => sum + operation.amountCents, 0);
    if (!Number.isSafeInteger(totalCents + data.amountCents)) {
      return "Общая сумма слишком велика для точного расчёта.";
    }
    const id = window.crypto?.randomUUID?.()
      || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setOperations(current => [...current, { id, ...data }]);
    return "";
  }

  return h("main", null,
    h("h1", null, "Учёт личных финансов"),
    h(OperationForm, { onAdd: addOperation }),
    h(Totals, { operations }),
    h(OperationsList, { operations })
  );
}

createRoot(document.getElementById("root")).render(h(App));
