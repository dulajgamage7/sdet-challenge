// tests/support/utils/helper.js
// helper for cleanup-ish actions we need in a few specs.
const { expect } = require("@playwright/test");

class Helper {
  constructor(page) {
    this.page = page;

    // This is the container that lists uploaded files on the page.
    // If the app’s markup changes, this might need a tweak.
    this.listContainer = page.locator("div.space-y-2");

    // Each row has a "Delete file" icon/button; we’ll click these to clean up.
    this.deleteButtons = this.listContainer.locator(
      'button[aria-label="Delete file"]'
    );
  }

  async deleteAllUploadedFiles() {
    // If the list is still rendering (or not present), don’t blow up the test.
    await this.listContainer
      .waitFor({ state: "attached", timeout: 2000 })
      .catch(() => {});

    let count = await this.deleteButtons.count();
    if (count === 0) {
      console.log("✅ No uploaded files to delete.");
      return;
    }

    console.log(`🗑️ Deleting ${count} uploaded file(s)...`);

    // Click first delete, assert the count drops by 1, repeat.
    // This way prevents flakiness in headless runs where UI updates can lag.
    while (count > 0) {
      const before = count;
      await this.deleteButtons.first().click();
      await expect(this.deleteButtons).toHaveCount(before - 1, {
        timeout: 7000,
      });
      count = await this.deleteButtons.count();

      // Tiny breather so the DOM can wait before the next loop.
      await this.page.waitForTimeout(100);
    }

    console.log("✅ All uploaded files deleted.");
  }
}

module.exports = { Helper };
