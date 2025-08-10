// tests/support/utils/open-allure-report.js
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const resolveFromRoot = (...segments) =>
  path.resolve(process.cwd(), ...segments);
const allureReportDir = resolveFromRoot("allure-report");

if (!fs.existsSync(allureReportDir)) {
  console.error(
    `❌ Allure report directory does not exist at: ${allureReportDir}`
  );
  process.exit(1);
}

console.log("🖥️ Opening Allure report...");
const openCmd = `npx allure open "${allureReportDir}"`;

exec(openCmd, (err, stdout, stderr) => {
  if (err) {
    console.error(`❌ Error opening Allure report:\n${stderr}`);
    process.exit(1);
  }
  console.log(stdout);
  console.log("✅ Allure report opened successfully.");
});
