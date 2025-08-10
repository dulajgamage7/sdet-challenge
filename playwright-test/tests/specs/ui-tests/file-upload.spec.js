// tests/ui-specs/file-upload.spec.js
const { test, expect } = require("@playwright/test");
const {
  PageObjectManager,
} = require("../../support/page-object-manager/page-object-manager.js");

let pageManager;

test.describe("Scenario: File Upload Flow - UI", () => {
  test.describe.configure({ mode: "serial" });
  test.beforeEach(async ({ page }) => {
    pageManager = new PageObjectManager(page);
  });

  /* single-file upload + process - Implement automation scripts to upload a single file using the application’s file upload functionality.*/
  test("Verify whether user is able to successfully upload and process a training document", async () => {
    const { filename, status } = pageManager.fileUploadData;

    await test.step("GIVEN I am on the file upload page", async () => {
      await pageManager.fileUploadPage().navigate();
      await expect(pageManager.page).toHaveURL(/localhost:8000\/?$/);
    });

    await test.step("AND I will first delete all the records", async () => {
      await pageManager.helper().deleteAllUploadedFiles();
      //after deletion check if the delete button is existing to verify all the recodrs have successfuly deleted
      await expect(pageManager.fileUploadPage().deleteFileButton).toHaveCount(
        0
      );
    });

    await test.step(`AND I upload "${filename}"`, async () => {
      await pageManager.fileUploadPage().uploadFile(filename);
      // Assert via locator getter from the page object
      await expect(
        pageManager.fileUploadPage().checkUploadedFile(filename)
      ).toBeVisible();
    });

    await test.step(`THEN the file should show status "${status.unprocessed}"`, async () => {
      await pageManager
        .fileUploadPage()
        .waitForStatus(filename, status.unprocessed);
      await expect(
        pageManager.fileUploadPage().statusLocator(filename, status.unprocessed)
      ).toHaveText("Unprocessed");
      await expect(
        pageManager.fileUploadPage().playButtonForFile(filename)
      ).toBeEnabled();
    });

    await test.step(`WHEN I click "Play button" for "${filename}"`, async () => {
      await pageManager.fileUploadPage().processFile(filename);
    });

    await test.step(`THEN the file status should update to "${status.processed}"`, async () => {
      await pageManager
        .fileUploadPage()
        .waitForStatus(filename, status.processed);
      await expect(
        pageManager.fileUploadPage().statusLocator(filename, status.processed)
      ).toHaveText("Processed");
      await expect(
        pageManager.fileUploadPage().playButtonForFile(filename)
      ).toBeDisabled();
    });
  });

  /* Implement automation scripts to upload multiple files using the application’s file upload functionality.*/
  test("Verify user can upload multiple training documents sequentially and process each", async () => {
    const { filenames, status } = pageManager.multipleFileUploadData;

    await test.step("GIVEN I am on the file upload page", async () => {
      await pageManager.fileUploadPage().navigate();
      await expect(pageManager.page).toHaveURL(/localhost:8000\/?$/);
    });

    await test.step("AND I delete all existing records", async () => {
      await pageManager.helper().deleteAllUploadedFiles();
      await expect(pageManager.fileUploadPage().deleteFileButton).toHaveCount(
        0
      );
    });

    for (const filename of filenames) {
      await test.step(`WHEN I upload "${filename}"`, async () => {
        await pageManager.fileUploadPage().uploadFile(filename);
        await expect(
          pageManager.fileUploadPage().checkUploadedFile(filename)
        ).toBeVisible();
      });
      // If the application provides progress indicators, ensure the status is properly tracked during the upload.
      await test.step(`THEN the file "${filename}" should show status "${status.unprocessed}"`, async () => {
        await pageManager
          .fileUploadPage()
          .waitForStatus(filename, status.unprocessed);
        await expect(
          pageManager
            .fileUploadPage()
            .statusLocator(filename, status.unprocessed)
        ).toHaveText("Unprocessed");
        await expect(
          pageManager.fileUploadPage().playButtonForFile(filename)
        ).toBeEnabled();
      });

      await test.step(`WHEN I process the file "${filename}"`, async () => {
        await pageManager.fileUploadPage().processFile(filename);
      });

      await test.step(`THEN the file "${filename}" status should update to "${status.processed}"`, async () => {
        await pageManager
          .fileUploadPage()
          .waitForStatus(filename, status.processed);
        await expect(
          pageManager.fileUploadPage().statusLocator(filename, status.processed)
        ).toHaveText("Processed");
        await expect(
          pageManager.fileUploadPage().playButtonForFile(filename)
        ).toBeDisabled();
      });
    }
  });

  //Ensure that the file upload is in progress (using both API and UI).
  test("Verify upload request completes (API) and UI shows state transitions", async ({
    page,
  }) => {
    const { filename, status } = pageManager.fileUploadData;

    await test.step("GIVEN I am on the file upload page and clean slate", async () => {
      await pageManager.fileUploadPage().navigate();
      await pageManager.helper().deleteAllUploadedFiles();
      await expect(pageManager.fileUploadPage().deleteFileButton).toHaveCount(
        0
      );
    });
    //
    let uploadResponse;
    await test.step("WHEN I upload a file AND observe the POST /documents/upload network request", async () => {
      const uploadResponsePromise = page.waitForResponse(
        (res) =>
          res.url().includes("/documents/upload") &&
          res.request().method() === "POST"
      );

      await pageManager.fileUploadPage().uploadFile(filename);
      uploadResponse = await uploadResponsePromise;
    });

    await test.step(`THEN the API response should have status 200`, async () => {
      expect(uploadResponse.ok()).toBeTruthy();
      expect(uploadResponse.status()).toBe(200);

      // (optional) sanity checks
      expect(uploadResponse.request().method()).toBe("POST");
      expect(uploadResponse.url()).toContain("/documents/upload");
    });

    await test.step("AND the file upload should be confirmed via API", async () => {
      // Parse the JSON response from the upload POST
      const json = await uploadResponse.json();

      // Debug log to help during development
      console.log("Upload API Response:", json);

      // API should say processed = false right after upload
      expect(json.filename).toBe(filename);
      expect(json.processed).toBe(false);

      // Optional sanity checks
      expect(json).toHaveProperty("created_at");
      expect(json).toHaveProperty("id");
    });

    await test.step("AND the UI should reflect that the file is ready for processing", async () => {
      
      await pageManager
        .fileUploadPage()
        .waitForStatus(filename, status.unprocessed);
      await expect(
        pageManager.fileUploadPage().statusLocator(filename, status.unprocessed)
      ).toBeVisible();
      await expect(
        pageManager.fileUploadPage().playButtonForFile(filename)
      ).toBeEnabled();
    });
  });
});
