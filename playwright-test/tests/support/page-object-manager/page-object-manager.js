// tests/support/page-object-manager/page-object-manager.js
// Central place to spin up page objects + expose test data for a given Playwright `page`.
// Keeps specs clean and avoids re-creating the same stuff everywhere.

const {
  FileUploadPage,
} = require("../page-objects/ui-pages/file-upload-page.js");
const { ChatBotPage } = require("../page-objects/ui-pages/chat-bot-page.js");

// Bring in test data used by specs (single + multiple upload cases, chatbot Q&A, etc.).
const {
  fileUploadData,
  multipleFileUploadData,
} = require("../../fixtures/test-data/spec-data/file-upload-data.js");
const chatBotData = require("../../fixtures/test-data/spec-data/chat-bot-data.js");

// Helper utilities and a couple of ready-made setup steps.
const { Helper } = require("../utils/helper.js");
const { deleteBeforeEach, fileUploadSetup } = require("../utils/testSetup.js");

class PageObjectManager {
  constructor(page) {
    // The live Playwright page managing things for.
    this.page = page;

    this._fileUploadPage = null;
    this._chatBotPage = null;

    // Helper is generic enough to create up-front
    this._helper = new Helper(this.page);
  }

  // ——— Page Objects ———

  fileUploadPage() {
    // Create once, reuse forever (well, for this test run).
    if (!this._fileUploadPage) {
      this._fileUploadPage = new FileUploadPage(this.page);
    }
    return this._fileUploadPage;
  }

  chatBotPage() {
    // Same as fileUploadPage pattern here.
    if (!this._chatBotPage) {
      this._chatBotPage = new ChatBotPage(this.page);
    }
    return this._chatBotPage;
  }

  helper() {
    return this._helper;
  }

  // ——— Test Data (getters to keep specs clean) ———

  // Single-file upload scenarios.
  get fileUploadData() {
    return fileUploadData;
  }

  // Multi-file upload scenarios.
  get multipleFileUploadData() {
    return multipleFileUploadData;
  }

  // Raw chatbot spec data bundle.
  get chatBotData() {
    return chatBotData;
  }

  // Inputs that send to the chatbot.
  get userInputs() {
    return chatBotData.userInputs;
  }

  // Expected answers that assert against.
  get expectedAnswers() {
    return chatBotData.expectedAnswers;
  }

  // The actual questions that want to ask.
  get chatQuestions() {
    return chatBotData.questions;
  }

  // ——— One-liner setup helpers ———
  // These just forward to shared utils while passing the manager,
  // so the utils can grab pages, data, etc., without a dozen params.

  async deleteBeforeEach() {
    return deleteBeforeEach(this);
  }

  async fileUploadSetup() {
    return fileUploadSetup(this);
  }
}

module.exports = { PageObjectManager };
