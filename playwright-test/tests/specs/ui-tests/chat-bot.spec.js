const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const {
  PageObjectManager,
} = require("../../support/page-object-manager/page-object-manager.js");

let pageManager;

test.describe("Chat Bot - Document-aware Q&A", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeEach(async ({ page }) => {
    pageManager = new PageObjectManager(page);
    await pageManager.deleteBeforeEach();
  });

  // ========== Test 1: Open Chat ==========
  test("Open the chat and verify it is ready for input @Regression", async () => {
    await test.step("GIVEN I should see the chatbot page and should be the main page", async () => {
      await expect(pageManager.page).toHaveURL(/localhost:8000\/?$/);
    });

    await test.step("AND chat UI renders", async () => {
      await expect(pageManager.chatBotPage().questionBox()).toBeVisible();
      await expect(pageManager.chatBotPage().askBtn()).toBeVisible();
    });

    await test.step("WHNE Ask Question is disabled before processing any document", async () => {
      await expect(pageManager.chatBotPage().askBtn()).toBeDisabled();
    });

    await test.step("AND a document is uploaded and processed", async () => {
      await pageManager.fileUploadSetup();
    });

    await test.step("THEN chat input should be enabled", async () => {
      await expect(pageManager.chatBotPage().askBtn()).toBeDisabled(); // button may still be disabled until focus
      await expect(pageManager.chatBotPage().questionBox()).toBeEnabled();
      // Often enablement toggles when there's text; verify it enables on typing
      await pageManager.chatBotPage().typeQuestion("hello");
      await expect(pageManager.chatBotPage().askBtn()).toBeEnabled();
    });
  });

  /// ========== Test 2: Verify Chat Input / basic messages ==========
  test("Send a message and verify the chatbot responds", async () => {
    const { greetingMessage, invalidGreetingMessage } = pageManager.userInputs;

    await test.step("GIVEN I should see the chatbot page and should be the main page", async () => {
      await expect(pageManager.page).toHaveURL(/localhost:8000\/?$/);
    });

    await test.step("WHEN a document is uploaded and processed", async () => {
      await pageManager.fileUploadSetup();
    });

    await test.step(`WHEN I send "${greetingMessage.question}"`, async () => {
      // Get a LOCATOR for the latest answer and assert exact text
      const answerLocator = await pageManager
        .chatBotPage()
        .askAndWaitForAnswerLocator(greetingMessage.question);
      await expect(answerLocator).toHaveText(greetingMessage.answer);
    });

    await test.step("AND UI behaves (button disabled while empty, enabled when text present)", async () => {
      await pageManager.chatBotPage().questionBox().fill("");
      await expect(pageManager.chatBotPage().askBtn()).toBeDisabled();
      await pageManager
        .chatBotPage()
        .questionBox()
        .fill(invalidGreetingMessage.question);
      await expect(pageManager.chatBotPage().askBtn()).toBeEnabled();
    });
  });

  // ========== Test 3: Ask 5 document-based questions (from file) and verify answers with fuzzy similarity ==========
  test("Ask 5 document-based questions (from file) and verify answers (fuzzy similarity)", async () => {
    const stringSimilarity = require("string-similarity");

    // simple, interview-friendly normalization
    const normalize = (s) =>
      s
        .toLowerCase()
        .replace(/\s+/g, " ") // collapse whitespace
        .trim();

    await test.step("GIVEN I should see the chatbot page and should be the main page", async () => {
      await expect(pageManager.page).toHaveURL(/localhost:8000\/?$/);
    });

    await test.step("WHEN a document is uploaded and processed", async () => {
      await pageManager.fileUploadSetup();
    });

    // Load 5 questions from file (supports "1 Foo" or plain lines)
    const questionsPath = path.resolve(
      "tests/fixtures/test-data/questions",
      "simple-questions.txt"
    );
    const fileContent = fs.readFileSync(questionsPath, "utf-8");
    const allLines = fileContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^\d+\s+/, "")); // strip "1 "

    const questions = allLines.slice(0, 5);
    const expectedAnswers = pageManager.chatBotData.expectedAnswers; // parallel array from test data

    const THRESHOLD = 0.45; // be pragmatic with LLMs; tweak if you like

    expect(questions.length).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < 5; i++) {
      const q = questions[i];
      const expected = expectedAnswers[i];

      await test.step(`WHEN I ask Q${i + 1}: "${q}"`, async () => {
        const answerLocator = await pageManager
          .chatBotPage()
          .askAndWaitForAnswerLocator(q, { timeout: 15000 });

        await expect(answerLocator).toBeVisible();

        const actual = await answerLocator.innerText();
        expect(actual && actual.length > 0).toBeTruthy();

        // Fuzzy similarity via library (0..1)
        const score = stringSimilarity.compareTwoStrings(
          normalize(actual),
          normalize(expected)
        );

        // Debug,options
        console.log("------------------------------------------------------");
        console.log(`Q${i + 1}: ${q}`);
        console.log(`Expected:\n${expected}`);
        console.log(`Actual:\n${actual}`);
        console.log(
          `Similarity Score: ${score.toFixed(3)} (needs ≥ ${THRESHOLD})`
        );
        console.log("------------------------------------------------------");

        expect(score).toBeGreaterThanOrEqual(THRESHOLD);
      });
    }
  });
});
