# RAG E2E Tests (Playwright) — README

A clean, end‑to‑end Playwright suite for a RAG app: upload training files → process them → ask the chatbot → verify answers. This doc explains how to run the app, execute tests locally or in CI, and generate reports.

---

## 1) Prerequisites

- **Docker & Docker Compose** (to run the app services)
- **Node.js** and **npm**
- **Java 17 (JRE)** only if you plan to generate Allure HTML **locally** (CI job handles this in Actions)

> Tip: Tests read the app URL from `PLAYWRIGHT_BASE_URL` (falls back to `http://localhost:8000`).

---

## 2) Start the Application (Docker)

From the repository root:

```bash
docker-compose -f docker-compose.yml up --force-recreate --build -d
```

- **Docker must be up and running** before executing tests.
- This builds and starts the front‑end and back‑end containers in the background.
- If your app service is named `app`, you can set:

  ```bash
  export PLAYWRIGHT_BASE_URL=http://app:8000
  ```

  Otherwise, local default is `http://localhost:8000`.

Optional (self‑signed HTTPS):

```bash
export IGNORE_HTTPS_ERRORS=1
```

- This builds and starts the front‑end and back‑end containers in the background.
- If your app service is named `app`, you can set:

  ```bash
  export PLAYWRIGHT_BASE_URL=http://app:8000
  ```

  Otherwise, local default is `http://localhost:8000`.

Optional (self‑signed HTTPS):

```bash
export IGNORE_HTTPS_ERRORS=1
```

---

## 3) Install Test Dependencies

Install Node deps (one‑time or after cloning):

```bash
npm ci
```

Install Playwright browsers and system deps:

```bash
npx playwright install --with-deps
```

> If you’re bootstrapping a **brand new** project, you’d use `npm init playwright@latest`. For this repo, it’s **already set up**, so you don’t need to run the init.

### Libraries used in this project

```bash
# Allure reporter plugin (produces allure-results/ during test runs)
npm install -D allure-playwright

# Allure CLI (turns allure-results/ into an HTML report)
npm install -D allure-commandline

# Extra fs helpers used by the report/cleanup scripts
npm install -D fs-extra

# For fuzzy matching chatbot answers vs expected text
npm install -D string-similarity
```

Why both Allure packages?

- **`allure-playwright`** → a Playwright **reporter** that writes JSON into `allure-results/` during the run.
- **`allure-commandline`** → the **CLI** that converts `allure-results/` into a browsable **HTML report**.

---

## 4) Project Layout (what matters)

```
playwright-test/
├─ playwright.config.*               # baseURL, reporters (HTML + Allure), projects
├─ tests/
│  ├─ fixtures/
│  │  └─ test-data/
│  │     ├─ spec-data/
│  │     │  ├─ file-upload-data.js  # filenames + status enums used in asserts
│  │     │  └─ chat-bot-data.js     # questions + expected answers
│  │     └─ training-data/          # actual files we upload in tests
│  │        ├─ advanced-questions-training.txt
│  │        └─ simple-question-training.txt
│  ├─ support/
│  │  ├─ page-objects/
│  │  │  └─ ui-pages/
│  │  │     ├─ file-upload-page.js  # upload/process/status helpers
│  │  │     └─ chat-bot-page.js     # ask/wait/get-answer helpers
│  │  ├─ page-object-manager/
│  │  │  └─ page-object-manager.js  # one place to get pages, data, setup flows
│  │  └─ utils/
│  │     ├─ helper.js               # cleanup: delete all uploaded files, etc.
│  │     ├─ testSetup.js            # happy-path setup: upload→process→assert
│  │     └─ report-clean.js         # wipes old reports on startup
│  └─ specs/                         # your test specs
```

**Why this structure?**

- **POM** keeps selectors/actions in one spot; specs stay small and readable.
- **Manager** hands out page objects, fixture data, and common setup flows.
- **Fixtures** separate content (filenames, expected answers) from test logic.

---

## 5) Running the Tests

### Local (default baseURL = `http://localhost:8000`)

```bash
# set or override baseURL if needed
export PLAYWRIGHT_BASE_URL=http://localhost:8000

# run everything
npx playwright test

# …or run a folder/file
npx playwright test tests/specs
```

If your package.json has scripts (example):

```bash
npm run playwright:run:allTests
npm run generate-report
npm run open-report
```

Use playwright:run:allUiTests if you want to open the playwright test runner

```bash
npm run playwright:run:allUiTests
npm run generate-report
npm run open-report
```

### In Docker (tests hitting the app container)

```bash
export PLAYWRIGHT_BASE_URL=http://app:8000
npx playwright test
```

---

## 6) Reports

### Playwright HTML report

- Auto-generated into `playwright-report/`.
- Open after a run:

  ```bash
  npx playwright show-report
  ```

### Allure report (locally)

1. Ensure you have `allure-playwright` and `allure-commandline` installed.
2. After a test run, generate the report:

   ```bash
   npm run generate-report
   npm run open-report
   ```

> The **Jenkins pipeline** generates and archives both the raw `allure-results/` and the final `allure-report/` for each run.

---

## 7) Matching Chatbot Answers (Fuzzy)

We use **`string-similarity`** to compare the chatbot’s answer vs. the expected text. This lets us assert a **similarity threshold** instead of strict equality, which is helpful for LLMs that paraphrase.

- Install: `npm i -D string-similarity`
- Example idea: compute `similarity = compareTwoStrings(actual, expected)` and assert `similarity >= 0.75` (tune per your needs).

> This approach reduces flaky failures from harmless wording differences while still catching wrong answers.

---

## 8) CI: Jenkins as Test Runner

We use **Jenkins** to run the Playwright suite locally. GitHub hosts the repository and triggers Jenkins, but need to trigger manully; Jenkins handles the build, test execution, and report publication.

### Jenkins pipeline (high level)

1. **Checkout** repository from GitHub.
2. **Node setup**: `npm ci`.
3. **Install Playwright browsers**: `npx playwright install --with-deps`.
4. **Run tests**: `npm run playwright:run:allTests`.
5. **Publish reports**:

   - Archive **Playwright HTML** in `playwright-report/`.
   - Archive **Allure results** in `allure-results/` and generate Allure HTML via `npm run generate-report`.
   - Publish with the **Allure Jenkins plugin**.

6. **Per‑run isolation**: each Jenkins execution is treated as a **new test run** with its own Allure report.

---

That’s it. Spin up Docker, install deps, run tests, and open the reports.
