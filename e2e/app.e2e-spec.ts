import { IQuatePage } from './app.po';

describe('iquate App', () => {
  let page: IQuatePage;

  beforeEach(() => {
    page = new IQuatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
