// tests/support/page-objects/ui-pages/chat-bot-page.js
class ChatBotPage {
  constructor(page) {
    this.page = page;
    this.baseUrl = page.context()._options.baseURL;

    // Scope to the chat input area that contains textarea + Ask button
    this.chatInputContainer = page
      .locator("div.space-y-2")
      .filter({ has: page.locator('textarea[placeholder^="Ask a question"]') })
      .first();

    this.textarea = this.chatInputContainer.locator(
      'textarea[placeholder^="Ask a question"]'
    );
    this.askButton = this.chatInputContainer.getByRole("button", {
      name: "Ask Question",
    });
    // Answers land as on main div; so will grab the last one
    this.answerCards = page.locator("div.space-y-4 .p-4");
    this.answerParagraphs = this.answerCards.locator("p");
  }

  async navigate() {
    await this.page.goto(`${this.baseUrl}/`);
  }
  // Tiny getters so specs read nicely
  questionBox() {
    return this.textarea;
  }
  askBtn() {
    return this.askButton;
  }
  latestAnswerCard() {
    return this.answerCards.last();
  }
  latestAnswerText() {
    return this.answerParagraphs.last();
  }

  // Small actions
  async typeQuestion(text) {
    await this.textarea.fill(text);
  }
  async clearQuestion() {
    await this.textarea.fill("");
  }
  async ask() {
    await this.askButton.click();
  }

  // Returns the final answer TEXT (string)
  async askAndWaitForAnswer(text, { timeout = 15000 } = {}) {
    await this.typeQuestion(text);
    await this.ask();
    await this.latestAnswerCard().waitFor({ timeout });
    return this.latestAnswerText().innerText();
  }

  // Returns a LOCATOR for the final answer (for toHaveText / toContainText)
  async askAndWaitForAnswerLocator(text, { timeout = 15000 } = {}) {
    await this.typeQuestion(text);
    await this.ask();
    await this.latestAnswerCard().waitFor({ timeout });
    return this.latestAnswerText();
  }
}

module.exports = { ChatBotPage };
