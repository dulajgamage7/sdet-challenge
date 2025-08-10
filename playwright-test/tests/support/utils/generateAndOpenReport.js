const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const resolveFromRoot = (...segments) =>
  path.resolve(process.cwd(), ...segments);
const allureResultsDir = resolveFromRoot("allure-results");
const allureReportDir = resolveFromRoot("allure-report");

async function execCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd, shell: true }, (err, stdout, stderr) => {
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      if (err) return reject(err);
      resolve();
    });
  });
}

function logExists(label, dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  ${label} does not exist at: ${dir}`);
    return false;
  }
  console.log(`✅ ${label} exists at: ${dir}`);
  return true;
}

async function generateAndOpenReport() {
  console.log("🔍 Checking directory existence...");
  const hasResults = logExists("Allure Results Directory", allureResultsDir);
  logExists("Allure Report Directory", allureReportDir);

  if (!hasResults) {
    console.error("❌ No allure-results found. Cannot generate report.");
    process.exit(1);
  }

  console.log("🚀 Generating Allure report...");
  await execCommand(
    `npx allure generate "${allureResultsDir}" --clean -o "${allureReportDir}"`
  );

  console.log("✅ Allure report generated successfully.");

  // If running on Jenkins, also copy to workspace root
  if (process.env.JENKINS_HOME) {
    const workspaceRoot =
      process.env.WORKSPACE || path.resolve(process.cwd(), "..");
    const rootResults = path.resolve(workspaceRoot, "allure-results");
    const rootReport = path.resolve(workspaceRoot, "allure-report");

    console.log("📦 Copying results to Jenkins workspace root...");
    fs.rmSync(rootResults, { recursive: true, force: true });
    fs.mkdirSync(rootResults, { recursive: true });
    fs.cpSync(allureResultsDir, rootResults, { recursive: true });

    console.log("🚀 Generating report in Jenkins workspace root...");
    await execCommand(
      `npx allure generate "${rootResults}" --clean -o "${rootReport}"`,
      workspaceRoot
    );

    console.log("ℹ️ Skipping report opening in Jenkins.");
    return;
  }

  // Local environment → open the report
  console.log("🖥️ Opening Allure report locally...");
  await execCommand(`npx allure open "${allureReportDir}"`);
  console.log("✅ Allure report opened successfully.");
}

generateAndOpenReport();
