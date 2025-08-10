// tests/support/utils/generate-allure-report.js
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const resolveFromRoot = (...segments) =>
  path.resolve(process.cwd(), ...segments);
const allureResultsDir = resolveFromRoot("allure-results");
const allureReportDir = resolveFromRoot("allure-report");

function logExists(label, dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  ${label} does not exist at: ${dir}`);
  } else {
    console.log(`✅ ${label} exists at: ${dir}`);
  }
}

console.log("🔍 Checking directory existence...");
logExists("Allure Results Directory", allureResultsDir);

console.log("🚀 Generating Allure report...");
const generateCmd = `npx allure generate "${allureResultsDir}" --clean -o "${allureReportDir}"`;

exec(generateCmd, (err, stdout, stderr) => {
  if (err) {
    console.error(`❌ Error generating Allure report:\n${stderr}`);
    process.exit(1);
  }
  console.log(stdout);
  console.log("✅ Allure report generated successfully.");
});
