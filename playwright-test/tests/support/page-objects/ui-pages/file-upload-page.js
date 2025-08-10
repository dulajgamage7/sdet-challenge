// tests/support/page-objects/ui-pages/file-upload-page.js
// Page object for the upload area: choose file → upload → process → status checks.
const path = require("path");

function escapeRegExp(str) {
  // So filenames like "a.b" don't mess up our regex filters
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class FileUploadPage {
  constructor(page) {
    this.page = page;

    // NOTE: this pokes a private field; it works, but if Playwright changes internals,
    // prefer passing baseURL from config.
    this.baseUrl = page.context()._options.baseURL;

    // Buttons/controls on the screen
    this.chooseFileButton = page.getByRole("button", { name: "Choose File" });
    this.uploadButton = page.getByRole("button").nth(1);
    this.deleteButton = page.locator(
      'div.space-y-2 button[aria-label="Delete file"]'
    );
  }

  async navigate() {
    await this.page.goto(`${this.baseUrl}/`);
  }

  async uploadFile(filename) {
    // Build an absolute path to the test fixture
    const filePath = path.resolve(
      "tests/fixtures/test-data/training-data/",
      filename
    );

    // Click the “Choose File” control, attach the file, then hit Upload.
    await this.chooseFileButton.click();
    await this.chooseFileButton.setInputFiles(filePath);
    await this.uploadButton.click();
  }

  // Expose the delete button list so tests can assert the count
  get deleteFileButton() {
    return this.deleteButton;
  }

  // ===== Locators we reuse in assertions =====

  checkUploadedFile(filename) {
    // One row per file (we take the latest if name repeats)
    const newFile = escapeRegExp(filename);
    return this.page
      .locator("div.space-y-2 > div")
      .filter({ hasText: new RegExp(newFile) })
      .last();
  }

  statusLocator(filename, status) {
    // Exact status badge inside the file’s card
    const newFileStatus = escapeRegExp(status);
    return this.checkUploadedFile(filename).getByText(
      new RegExp(`^${newFileStatus}$`)
    );
  }

  playButtonForFile(filename) {
    // The "Process file" button lives inside the file’s row
    return this.checkUploadedFile(filename).getByRole("button", {
      name: "Process file",
    });
  }

  // ===== Small actions/waits =====

  async processFile(filename) {
    const btn = this.playButtonForFile(filename);
    await btn.waitFor({ state: "visible" });
    await btn.click();
  }

  async waitForStatus(filename, status, timeout = 10000) {
    await this.statusLocator(filename, status).waitFor({ timeout });
  }
}

module.exports = { FileUploadPage };
