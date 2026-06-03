const axios = require("axios");

async function getNews(query) {
  const response = await axios.get("https://newsapi.org/v2/everything", {
    params: {
      q: query,
      apiKey: process.env.NEWS_API_KEY,
      pageSize: 12,
      sortBy: "publishedAt",
      language: "ru"
    },
  });

  return response.data.articles || [];
}

module.exports = { getNews };
