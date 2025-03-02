import { drawChapter } from "./draw-chapter.js";

const output = document.querySelector("#output");
/**@type {HTMLInputElement} */
const input = document.querySelector("#filelink");
/**@type {HTMLButtonElement} */
const loadBtn = document.querySelector("#load-button");
/** @type {HTMLDivElement} */
const controls = document.querySelector("#controls");
/** @type {HTMLSelectElement} */
const chapterSelect = document.querySelector("#chapterselect");
/** @type {HTMLSelectElement} */
const subChapterSelect = document.querySelector("#subchapterselect");
/** @type {HTMLButtonElement} */
const prevButton = document.querySelector("#prev-chapter");
/** @type {HTMLButtonElement} */
const nextButton = document.querySelector("#next-chapter");
/** @type {HTMLDivElement} */
const loader = document.querySelector("#loader");
/**@type {HTMLParagraphElement} */
const title = document.querySelector("#title");

/**
 * @param {string} url
 * @returns {Promise}
 */
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
let currentUrl = "";

loadBtn.addEventListener("click", loadQampaign);

async function loadQampaign() {
  try {
    const url = new URL(input.value, window.location.origin);
    if (url.href) {
      const data = await fetchIndexJson(url.href);
      if (!data) {
        throw new Error("valid data not present in file");
      }
      currentUrl = url.href;
      updateWindowUrl("link", currentUrl);
      loadChapters(data.name, data.chapters);
    }
  } catch (err) {
    console.error("Error loading index file", err, input.value);
    alert("Please check your link");
  }
}

/**
 * @param {string} key
 * @param {string} value
 */
function updateWindowUrl(key, value) {
  const windowUrl = new URL(window.location.href);
  windowUrl.searchParams.set(key, value);
  window.history.replaceState(undefined, undefined, windowUrl.href);
}

function loadChapters(name, chapters) {
  title.innerText = name;
  chapterSelect.innerHTML = "";
  for (const chapter of chapters) {
    const option = document.createElement("option");
    option.text = getChapterName(chapter.name);
    option.value = chapter.file;
    chapterSelect.appendChild(option);
  }
  controls.classList.remove("hidden");
  loadChapter();
}

async function loadChapter() {
  const value = chapterSelect.value;
  const chapterUrl = new URL(value, currentUrl);
  const chapterJson = await renderChapterJson(chapterUrl, currentUrl);
  subChapterSelect.innerHTML = "";
  for (let index = 0; index < chapterJson.entries.length; index++) {
    const entry = chapterJson.entries[index];
    const option = document.createElement("option");
    option.text = `Sub-Chapter ${index + 1}`;
    option.value = entry.messages?.[0]?.id;
    subChapterSelect.appendChild(option);
  }
  updateWindowUrl("chapter", chapterSelect.selectedIndex.toString());
}

async function gotoSubChapter() {
  const value = subChapterSelect.value;
  const preamble = document.querySelector(`[data-first-message-id="${value}"`);
  preamble?.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
}

function handlePrevChapter() {
  if (chapterSelect.selectedIndex === 0) {
    return;
  }
  chapterSelect.selectedIndex--;
  loadChapter();
}

function handleNextChapter() {
  if (chapterSelect.selectedIndex === chapterSelect.options.length - 1) {
    return;
  }
  chapterSelect.selectedIndex++;
  loadChapter();
}

chapterSelect.addEventListener("change", loadChapter);
subChapterSelect.addEventListener("change", gotoSubChapter);
prevButton.addEventListener("click", handlePrevChapter);
nextButton.addEventListener("click", handleNextChapter);

/**
 * @param {string} chapterName
 * @returns {string}
 */
function getChapterName(chapterName) {
  if (chapterName.includes("/")) {
    return chapterName.split("/").at(-1);
  } else if (chapterName.includes("\\")) {
    return chapterName.split("\\").at(-1);
  }
  return chapterName;
}

async function fetchIndexJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await response.json();
  if (data.name && Array.isArray(data.chapters) && data.format === "json") {
    return data;
  } else {
    console.error("error loading json data", data);
  }
}

async function renderChapterJson(url, baseUrl) {
  loader.classList.remove("hidden");
  output.classList.add("hidden");
  const chapterJson = await fetchChapter(url);
  drawChapter(chapterJson, baseUrl, output);
  loader.classList.add("hidden");
  output.classList.remove("hidden");
  return chapterJson;
}

window.addEventListener("DOMContentLoaded", async () => {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const link = searchParams.get("link");
  if (!link) {
    return;
  }

  input.value = link;
  await loadQampaign();
  const chapter = url.searchParams.get("chapter");
  if (!chapter) {
    return;
  }
  chapterSelect.selectedIndex = parseInt(chapter);
  await loadChapter();
  const subChapter = url.searchParams.get("subchapter");
  if (!subChapter) {
    return;
  }
  subChapterSelect.selectedIndex = parseInt(subChapter);
  await gotoSubChapter();
});
