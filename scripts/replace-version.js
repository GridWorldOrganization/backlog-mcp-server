import { readFileSync, writeFileSync, copyFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
const version = pkg.version;

const templatePath = "./src/version.template.ts";
const outputPath = "./src/version.ts";

// Always reset from template before injecting
copyFileSync(templatePath, outputPath);

const content = readFileSync(outputPath, "utf8");
const replaced = content.replace(/__VERSION__/, version);
writeFileSync(outputPath, replaced);

console.log(`✔ Injected VERSION=${version} into ${outputPath}`);
