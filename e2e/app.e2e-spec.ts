import { CozyChatbotPage } from './app.po';

describe('cozy-chatbot App', () => {
  let page: CozyChatbotPage;

  beforeEach(() => {
    page = new CozyChatbotPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
