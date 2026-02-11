import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPrompt,
  DEFAULT_DEPLOY_TARGET,
  REQUIRED_PROMPT_PHRASES,
} from "../app/prompt-template.js";

test("buildPrompt injects app idea and deploy target", () => {
  const appIdea = "Collaborative wiki with auth and realtime comments";
  const deployTarget = "Netlify";
  const prompt = buildPrompt({ appIdea, deployTarget });

  assert.match(prompt, /My app idea:/);
  assert.match(prompt, /Collaborative wiki with auth and realtime comments/);
  assert.match(prompt, /Deploy: Netlify one-click if possible - provide command\./);
});

test("buildPrompt trims incoming values", () => {
  const prompt = buildPrompt({
    appIdea: "   AI journaling app with semantic search   ",
    deployTarget: "   Vercel   ",
  });

  assert.match(prompt, /AI journaling app with semantic search/);
  assert.match(prompt, /Preferred deploy target: Vercel\./);
});

test("buildPrompt falls back to default deploy target", () => {
  const prompt = buildPrompt({
    appIdea: "Fitness planner with streaks and reminders",
    deployTarget: " ",
  });

  assert.match(prompt, new RegExp(`Preferred deploy target: ${DEFAULT_DEPLOY_TARGET}\\.`));
});

test("buildPrompt rejects empty app idea", () => {
  assert.throws(
    () => buildPrompt({ appIdea: "   ", deployTarget: "Vercel" }),
    /App idea is required/,
  );
});

test("generated prompt retains critical reliability phrases", () => {
  const prompt = buildPrompt({
    appIdea: "Smart invoicing dashboard with Supabase auth",
    deployTarget: "Cloudflare Pages",
  });

  for (const phrase of REQUIRED_PROMPT_PHRASES) {
    assert.match(prompt, new RegExp(escapeRegExp(phrase)));
  }
});

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
