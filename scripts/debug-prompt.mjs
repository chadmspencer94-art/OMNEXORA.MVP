import { buildPrompt, DEFAULT_DEPLOY_TARGET } from "../app/prompt-template.js";

const args = process.argv.slice(2);

function parseArgs(inputArgs) {
  const parsed = {
    appIdea: "",
    deployTarget: DEFAULT_DEPLOY_TARGET,
  };

  for (let i = 0; i < inputArgs.length; i += 1) {
    const token = inputArgs[i];
    if (token === "--idea") {
      parsed.appIdea = inputArgs[i + 1] ?? "";
      i += 1;
    } else if (token === "--deploy") {
      parsed.deployTarget = inputArgs[i + 1] ?? DEFAULT_DEPLOY_TARGET;
      i += 1;
    }
  }

  return parsed;
}

const { appIdea, deployTarget } = parseArgs(args);

if (!appIdea.trim()) {
  console.error("Missing required --idea argument.");
  console.error(
    'Usage: npm run debug:prompt -- --idea "Realtime todo with auth and offline support" --deploy "Vercel"',
  );
  process.exit(1);
}

const output = buildPrompt({ appIdea, deployTarget });
const words = output.trim().split(/\s+/).length;

console.log("Prompt generated successfully.");
console.log(`Deploy target: ${deployTarget}`);
console.log(`Characters: ${output.length}`);
console.log(`Words: ${words}`);
console.log("\n--- BEGIN PROMPT ---\n");
console.log(output);
console.log("\n--- END PROMPT ---");
