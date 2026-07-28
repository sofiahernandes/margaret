#!/usr/bin/env node
// margaret: guards against a command/skill listed in plugin.yaml shipping with no backing file (or vice versa)
// commands.test.js catches for its multi-host command set, scoped down to
// margaret's single-host layout (commands/*.toml or *.md, skills/*/SKILL.md).

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const read = (relPath) => fs.readFileSync(path.join(root, relPath), "utf8");

function parseYamlList(yaml, key) {
  const re = new RegExp(`^${key}:\\n((?:\\s+-\\s+\\S+\\n?)+)`, "m");
  const match = yaml.match(re);
  if (!match) return [];
  return [...match[1].matchAll(/-\s+(\S+)/g)].map((m) => m[1]);
}

const yaml = read("plugin.yaml");
const commands = parseYamlList(yaml, "provides_commands");
const skills = parseYamlList(yaml, "provides_skills");

let failed = false;
const fail = (msg) => {
  console.error(msg);
  failed = true;
};

if (!commands.length)
  fail("plugin.yaml: provides_commands is empty or unparsed");
if (!skills.length) fail("plugin.yaml: provides_skills is empty or unparsed");

for (const name of commands) {
  const tomlPath = path.join(root, "commands", `${name}.toml`);
  const mdPath = path.join(root, "commands", `${name}.md`);
  if (!fs.existsSync(tomlPath) && !fs.existsSync(mdPath)) {
    fail(`missing commands/${name}.toml or commands/${name}.md`);
  }
}

for (const name of skills) {
  const skillPath = path.join(root, "skills", name, "SKILL.md");
  if (!fs.existsSync(skillPath)) {
    fail(`missing skills/${name}/SKILL.md`);
    continue;
  }
  const body = read(path.join("skills", name, "SKILL.md"));
  if (!/^---\n[\s\S]*?\bname:\s*(\S+)/m.test(body)) {
    fail(`skills/${name}/SKILL.md missing 'name:' in frontmatter`);
  } else {
    const declaredName = body.match(/\bname:\s*(\S+)/)[1];
    if (declaredName !== name) {
      fail(
        `skills/${name}/SKILL.md declares name '${declaredName}', expected '${name}'`,
      );
    }
  }
  if (!/\bdescription:/.test(body)) {
    fail(`skills/${name}/SKILL.md missing 'description:' in frontmatter`);
  }
}

// Every .toml command must at least parse as description/prompt pairs.
const commandsDir = path.join(root, "commands");
for (const file of fs.readdirSync(commandsDir)) {
  if (!file.endsWith(".toml")) continue;
  const body = read(path.join("commands", file));
  if (!/^description\s*=\s*"/m.test(body))
    fail(`commands/${file} missing description = "..."`);
  if (!/^prompt\s*=\s*"/m.test(body))
    fail(`commands/${file} missing prompt = "..."`);
}

if (failed) {
  console.error(
    "Fix the drift above so plugin.yaml, commands/, and skills/ agree.",
  );
  process.exit(1);
}

console.log(
  `Structure OK: ${commands.length} commands, ${skills.length} skills all backed and consistent.`,
);
