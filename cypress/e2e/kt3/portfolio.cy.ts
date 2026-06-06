// cypress/e2e/kt3/portfolio.cy.ts
// KT3 — Moj portfolio (bez beforeEach — sve u it)

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const CLIENT = { email: 'c@b.com', role: 'Client', permissions: ['SECURITIES_TRADE_LIMITED'] };

const H = { holdings: [
  { listingId: 1, listingType: 'STOCK', ticker: 'AAPL', quantity: 10, publicQuantity: 0, currentPrice: 185.5, averagePurchasePrice: 160.0, profit: 255.0, lastModified: '2025-05-10T12:00:00Z' },
  { listingId: 2, listingType: 'FUTURES', ticker: 'NQ=F', quantity: 5, publicQuantity: 0, currentPrice: 19000.0, averagePurchasePrice: 19100.0, profit: -100.0, lastModified: '2025-05-09T10:00:00Z' },
], totalProfit: 155.0, yearlyTaxPaid: 1500.0, monthlyTaxDue: 300.0 };

function go(sum?: any) {
  cy.intercept('GET', /\/order\/portfolio/, { statusCode: 200, body: sum || H }).as('p');
  cy.intercept('GET', /\/funds\/my-positions/, { statusCode: 200, body: [] });
  cy.visit('/portfolio', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT)); } });
  cy.wait('@p');
}

describe('KT3 — Portfolio', () => {

  it('AAPL i NQ=F', () => { go(); cy.contains('AAPL').should('be.visible'); cy.contains('NQ=F').should('be.visible'); });
  it('Profit', () => { go(); cy.contains('Profit').should('be.visible'); });
  it('Porez', () => { go(); cy.contains('Plaćeno ove godine').should('be.visible'); cy.contains('Neplaćeno ovog meseca').should('be.visible'); });
  it('OTC', () => { go(); cy.contains('Javni režim za OTC').should('be.visible'); });
  it('Bez Iskoristi', () => {
    go({ holdings: [...H.holdings, { listingId: 99, listingType: 'OPTION', ticker: 'AAPL-OPT', quantity: 2, publicQuantity: 0, exercisable: true, currentPrice: 5.0, averagePurchasePrice: 4.0, profit: 10.0, lastModified: '2025-05-01T10:00:00Z' }], totalProfit: 10, yearlyTaxPaid: 0, monthlyTaxDue: 0 });
    cy.contains('button', 'Iskoristi opciju').should('not.exist');
  });
  it('Bez tokena → /login', () => {
    cy.visit('/portfolio', { onBeforeLoad(win: any) { win.localStorage.clear(); } });
    cy.url().should('include', '/login');
  });
});
