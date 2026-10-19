import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

// createElement позволяет писать React в обычном файле .js без JSX.
const h = React.createElement;
const books = [
  { id: 1, title: "Евгений Онегин", author: "Александр Пушкин", price: 450 },
  { id: 2, title: "Мёртвые души", author: "Николай Гоголь", price: 520 },
  { id: 3, title: "Преступление и наказание", author: "Фёдор Достоевский", price: 650 },
  { id: 4, title: "Война и мир", author: "Лев Толстой", price: 900 },
  { id: 5, title: "Вишнёвый сад", author: "Антон Чехов", price: 380 }
];

function Catalog() {
  return h("section", null,
    h("h2", null, "Список книг"),
    books.map(book => h("article", { className: "book", key: book.id },
      h("h3", null, book.title),
      h("p", null, `Автор: ${book.author}`),
      h("p", null, `Цена: ${book.price} руб.`)
    ))
  );
}

function Cart() {
  return h("section", null,
    h("h2", null, "Корзина"),
    h("p", null, "Корзина пуста.")
  );
}

function getPage() {
  return window.location.hash === "#/cart" ? "cart" : "catalog";
}

function App() {
  const [page, setPage] = useState(getPage);

  useEffect(() => {
    function changePage() {
      setPage(getPage());
    }
    window.addEventListener("hashchange", changePage);
    return () => window.removeEventListener("hashchange", changePage);
  }, []);

  return h("main", null,
    h("h1", null, "Каталог книг"),
    h("nav", { "aria-label": "Навигация" },
      h("a", { href: "#/catalog", "aria-current": page === "catalog" ? "page" : undefined }, "Каталог"),
      h("a", { href: "#/cart", "aria-current": page === "cart" ? "page" : undefined }, "Корзина")
    ),
    page === "catalog" ? h(Catalog) : h(Cart)
  );
}

createRoot(document.getElementById("root")).render(h(App));
