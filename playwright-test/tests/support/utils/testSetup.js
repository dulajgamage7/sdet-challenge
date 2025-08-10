// tests/support/utils/testSetup.js
// A couple of one-liners to keep specs readable.
const { expect } = require("@playwright/test");

async function deleteBeforeEach(pageManager) {
  // Go to the upload page and nuke any leftover files
  await pageManager.fileUploadPage().navigate();
  await pageManager.helper().deleteAllUploadedFiles();

  // Sanity check: list should be empty after cleanup
  await expect(pageManager.fileUploadPage().deleteFileButton).toHaveCount(0);
}

async function fileUploadSetup(pageManager) {
  // Pull the happy-path upload data from fixtures
  const { filename, status } = pageManager.fileUploadData;

  // 1) Upload the file
  await pageManager.fileUploadPage().uploadFile(filename);

  // 2) Wait for "unprocessed" (aka: indexed, ready to process)
  await pageManager
    .fileUploadPage()
    .waitForStatus(filename, status.unprocessed);
  await expect(
    pageManager.fileUploadPage().playButtonForFile(filename)
  ).toBeEnabled();

  // 3) Click process play button and wait for "processed" (ready for Q&A)
  await pageManager.fileUploadPage().processFile(filename);
  await pageManager.fileUploadPage().waitForStatus(filename, status.processed);
  await expect(
    pageManager.fileUploadPage().playButtonForFile(filename)
  ).toBeDisabled();
}

module.exports = { deleteBeforeEach, fileUploadSetup };
