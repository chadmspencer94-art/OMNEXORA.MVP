import { buildPrompt, DEFAULT_DEPLOY_TARGET } from "./prompt-template.js";

const form = document.querySelector("#prompt-form");
const appIdeaField = document.querySelector("#app-idea");
const deployTargetField = document.querySelector("#deploy-target");
const outputField = document.querySelector("#prompt-output");
const copyButton = document.querySelector("#copy-prompt");
const downloadButton = document.querySelector("#download-prompt");
const statusText = document.querySelector("#status-text");
const outputStats = document.querySelector("#output-stats");
const themeToggle = document.querySelector("#theme-toggle");

const DEFAULT_APP_IDEA =
  "Real-time collaborative todo app with Supabase auth, sharing links, dark mode UI, and offline support.";
const THEME_KEY = "ultra_reliable_prompt_builder_theme";

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function updateStats(content) {
  const text = String(content ?? "");
  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  outputStats.textContent = `${characters} chars | ${words} words`;
}

function setOutput(content) {
  outputField.value = content;
  const hasContent = Boolean(content.trim());
  copyButton.disabled = !hasContent;
  downloadButton.disabled = !hasContent;
  updateStats(content);
}

function generatePrompt() {
  try {
    const prompt = buildPrompt({
      appIdea: appIdeaField.value,
      deployTarget: deployTargetField.value || DEFAULT_DEPLOY_TARGET,
    });
    setOutput(prompt);
    setStatus("Prompt generated. Copy into Cursor Chat or Agent mode.");
  } catch (error) {
    setOutput("");
    setStatus(error instanceof Error ? error.message : "Unable to generate prompt.", true);
  }
}

async function copyPromptToClipboard() {
  const content = outputField.value;
  if (!content) {
    setStatus("Generate a prompt before copying.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(content);
    setStatus("Copied prompt to clipboard.");
  } catch {
    outputField.focus();
    outputField.select();
    const copied = document.execCommand("copy");
    outputField.setSelectionRange(0, 0);
    setStatus(copied ? "Copied prompt to clipboard." : "Copy failed. Use manual copy.", !copied);
  }
}

function downloadPrompt() {
  const content = outputField.value;
  if (!content) {
    setStatus("Generate a prompt before downloading.", true);
    return;
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ultra-reliable-master-prompt.txt";
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus("Downloaded prompt as ultra-reliable-master-prompt.txt.");
}

function applyTheme(theme) {
  const selectedTheme = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = selectedTheme;
  localStorage.setItem(THEME_KEY, selectedTheme);
  themeToggle.textContent = selectedTheme === "dark" ? "Switch to light" : "Switch to dark";
}

function initializeTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  applyTheme(storedTheme || systemTheme);
}

function initializeForm() {
  if (!appIdeaField.value.trim()) {
    appIdeaField.value = DEFAULT_APP_IDEA;
  }
  if (!deployTargetField.value.trim()) {
    deployTargetField.value = DEFAULT_DEPLOY_TARGET;
  }
  generatePrompt();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generatePrompt();
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    appIdeaField.value = "";
    setOutput("");
    setStatus("Form reset. Enter app idea to continue.");
  }, 0);
});

copyButton.addEventListener("click", () => {
  copyPromptToClipboard();
});

downloadButton.addEventListener("click", () => {
  downloadPrompt();
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme;
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

initializeTheme();
initializeForm();
