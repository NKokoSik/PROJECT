const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const newsContainer = document.getElementById("newsContainer");
const savedContainer = document.getElementById("savedContainer");
const resultCount = document.getElementById("resultCount");
const savedCount = document.getElementById("savedCount");
let currentArticles = [];

const getSavedNews = () => JSON.parse(localStorage.getItem("savedNews") || "[]");
const setSavedNews = (items) => localStorage.setItem("savedNews", JSON.stringify(items));

const renderSavedNews = () => {
  const saved = getSavedNews();
  savedCount.textContent = saved.length;
  if (!saved.length) {
    savedContainer.innerHTML = "<p class='empty'>Нет сохраненных новостей</p>";
    return;
  }
  savedContainer.innerHTML = saved
    .map(
      (item, index) => `
      <div class="article">
        <div class="article-top">
          <h3>${item.title}</h3>
          <button type="button" data-remove-index="${index}">Удалить</button>
        </div>
        <p>${item.description || "Описание отсутствует"}</p>
        <a href="${item.url}" target="_blank" rel="noreferrer">Читать источник</a>
      </div>
    `,
    )
    .join("");
};

const renderNews = (articles) => {
  currentArticles = articles;
  resultCount.textContent = articles.length;
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
          <button type="button" data-save-index="${index}">Сохранить</button>
        </div>
        <p>${article.description || "Описание отсутствует"}</p>
        <div class="meta">
          ${article.source?.name || "Источник неизвестен"}
          ${article.publishedAt ? `• ${new Date(article.publishedAt).toLocaleString()}` : ""}
        </div>
      </div>
    `,
    )
    .join("");
};

const saveArticle = (index) => {
  const article = currentArticles[index];
  if (!article) return;
  const saved = getSavedNews();
  if (saved.some((item) => item.url === article.url)) return;
  saved.unshift(article);
  setSavedNews(saved);
  renderSavedNews();
};

const removeSaved = (index) => {
  const saved = getSavedNews();
  saved.splice(index, 1);
  setSavedNews(saved);
  renderSavedNews();
};

const searchNews = async (query) => {
  if (!query) {
    newsContainer.innerHTML = "<p class='empty'>Введите тему для поиска</p>";
    resultCount.textContent = 0;
    return;
  }
  newsContainer.innerHTML = "<p class='loading'>Загрузка...</p>";
  try {
    const response = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Ошибка запроса");
    const data = await response.json();
    renderNews(data);
  } catch (error) {
    resultCount.textContent = 0;
    newsContainer.innerHTML = "<p class='empty'>Ошибка. Проверьте ключ API и подключение.</p>";
    console.error(error);
  }
};

newsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-save-index]");
  if (!button) return;
  saveArticle(Number(button.dataset.saveIndex));
});

savedContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-remove-index]");
  if (!button) return;
  removeSaved(Number(button.dataset.removeIndex));
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchNews(searchInput.value.trim());
});

renderSavedNews();
