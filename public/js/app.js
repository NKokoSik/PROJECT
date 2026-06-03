const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const newsContainer = document.getElementById("newsContainer");
const savedContainer = document.getElementById("savedContainer");
let currentArticles = [];

function getSavedNews() {
  return JSON.parse(localStorage.getItem("savedNews") || "[]");
}

function setSavedNews(saved) {
  localStorage.setItem("savedNews", JSON.stringify(saved));
}

function renderSavedNews() {
  const saved = getSavedNews();

  if (!saved.length) {
    savedContainer.innerHTML = "<p class='empty'>Нет сохраненных новостей</p>";
    return;
  }

  savedContainer.innerHTML = saved
    .map(
      (article, index) => `
      <div class="article">
        <div class="article-top">
          <h3>${article.title}</h3>
          <button class="remove-btn" data-remove-index="${index}">Удалить</button>
        </div>
        <p>${article.description || ""}</p>
        <a href="${article.url}" target="_blank" rel="noreferrer">Читать на источнике</a>
      </div>
    `,
    )
    .join("");
}

function renderNews(articles) {
  currentArticles = articles;

  if (!articles.length) {
    newsContainer.innerHTML = "<p class='empty'>Ничего не найдено</p>";
    return;
  }

  newsContainer.innerHTML = articles
    .map(
      (article, index) => `
      <div class="article">
        <div class="article-top">
          <h3>${article.title}</h3>
          <button class="save-btn" data-save-index="${index}">Сохранить</button>
        </div>
        <p>${article.description || ""}</p>
        <div class="meta">
          ${article.source?.name || "Источник неизвестен"}
          ${article.publishedAt ? `• ${new Date(article.publishedAt).toLocaleString()}` : ""}
        </div>
      </div>
    `,
    )
    .join("");
}

function saveNews(index) {
  const article = currentArticles[index];
  if (!article) {
    return;
  }

  const saved = getSavedNews();
  if (saved.some((item) => item.url === article.url)) {
    return;
  }

  saved.unshift(article);
  setSavedNews(saved);
  renderSavedNews();
}

function removeSavedNews(index) {
  const saved = getSavedNews();
  saved.splice(index, 1);
  setSavedNews(saved);
  renderSavedNews();
}

newsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-save-index]");
  if (!button) {
    return;
  }

  const index = Number(button.dataset.saveIndex);
  saveNews(index);
});

savedContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove-index]");
  if (!button) {
    return;
  }

  const index = Number(button.dataset.removeIndex);
  removeSavedNews(index);
});

async function searchNews() {
  const query = searchInput.value.trim();

  if (!query) {
    newsContainer.innerHTML = "<p class='empty'>Введите тему для поиска</p>";
    return;
  }

  newsContainer.innerHTML = "<p class='loading'>Загрузка...</p>";

  try {
    const response = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Ошибка запроса");
    }

    const articles = await response.json();
    renderNews(articles);
  } catch (error) {
    newsContainer.innerHTML = "<p class='empty'>Не удалось получить новости. Проверьте ключ API и подключение.</p>";
    console.error(error);
  }
}

searchBtn.addEventListener("click", searchNews);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchNews();
  }
});

renderSavedNews();
