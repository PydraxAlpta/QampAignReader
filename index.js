import { drawChapter } from "./draw-chapter.js";

const output = document.querySelector("#output");
/**@type {HTMLInputElement} */
const input = document.querySelector("#filelink");
const loadBtn = document.querySelector("#load-button");

async function fetchChapter(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();
  if (data.name && data.entries) {
    return data;
  }
}

loadBtn.addEventListener("click", async () => {
  try {
    const url = new URL(input.value, window.location.origin);
    if (url.href) {
      const data = await fetchIndexJson(url.href);
      if (!data) {
        throw new Error("valid data not present in file");
      }
      console.log(data.name, data.chapters, data.format);
      alert("Loading successful");
      renderChapterJson(new URL(data.chapters[0], url.href).href);
    }
  } catch (err) {
    console.error("Error loading index file", err, input.value);
    alert("Please check your link");
  }
});

async function fetchIndexJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();
  if (data.name && data.chapters && data.format === "json") {
    return data;
  } else {
    console.log("loaded data", data);
  }
}

async function renderChapterJson(url) {
  const chapterJson = await fetchChapter(url);
  drawChapter(chapterJson, url, output);
}
