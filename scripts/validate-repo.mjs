import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import {
  buildPrompt,
  REQUIRED_PROMPT_PHRASES,
  DEFAULT_DEPLOY_TARGET,
} from "../app/prompt-template.js";

const REQUIRED_FILES = [
  "index.html",
  "styles.css",
  "app/main.js",
  "app/prompt-template.js",
  "docs/grok-master-prompt.md",
];

async function assertFileExists(filePath) {
  await access(filePath, constants.F_OK);
}

async function validateFilesExist() {
  for (const filePath of REQUIRED_FILES) {
    await assertFileExists(filePath);
  }
}

async function validateDocs() {
  const docs = await readFile("docs/grok-master-prompt.md", "utf8");
  const requiredDocPhrases = [
    "# Grok Master Prompt for Cursor",
    "## Copy-paste prompt",
    "<APP_IDEA>",
    "<DEPLOY_TARGET>",
  ];

  for (const phrase of requiredDocPhrases) {
    if (!docs.includes(phrase)) {
      throw new Error(`docs/grok-master-prompt.md is missing phrase: ${phrase}`);
    }
  }
}

function validateBuilderOutput() {
  const sampleIdea = "Realtime kanban board with auth and shared workspaces";
  const prompt = buildPrompt({
    appIdea: sampleIdea,
    deployTarget: DEFAULT_DEPLOY_TARGET,
  });

  for (const phrase of REQUIRED_PROMPT_PHRASES) {
    if (!prompt.includes(phrase)) {
      throw new Error(`Generated prompt is missing reliability phrase: ${phrase}`);
    }
  }

  if (!prompt.includes(sampleIdea)) {
    throw new Error("Generated prompt does not include the provided app idea.");
  }

  if (!prompt.includes(DEFAULT_DEPLOY_TARGET)) {
    throw new Error("Generated prompt does not include the selected deploy target.");
  }
}

async function run() {
  await validateFilesExist();
  await validateDocs();
  validateBuilderOutput();
  console.log("Validation passed: files, docs, and prompt generator are healthy.");
}

run().catch((error) => {
  console.error("Validation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
