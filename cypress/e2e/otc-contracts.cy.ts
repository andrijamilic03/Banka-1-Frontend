// cypress/e2e/otc-contracts.cy.ts
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const CLIENT = { email: 'c@b.com', role: 'Client', permissions: ['OTC_TRADE'] };
const CONTRACTS = [{ id: 1, stockTicker: 'AAPL', buyerId: 77, sellerId: 88, amount: 50, pricePerStock: 150, settlementDate: '2027-12-31', status: 'ACTIVE', createdAt: '2026-01-01', interbank: false }];

function visit() {
  cy.intercept('GET', /\/api\/interbank\/otc\/negotiations/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/offers\/active/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/public-stocks/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/contracts\/my/, { statusCode: 200, body: CONTRACTS }).as('c');
  cy.intercept('GET', /\/stocks\/price-feed/, { statusCode: 200, body: [] });
  cy.visit('/otc', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT)); } });
  cy.contains('button', 'Izvršeni ugovori').click();
  cy.wait('@c');
  cy.get('[data-testid="otc-contracts-table"]', { timeout: 15000 }).should('be.visible');
}

describe('OTC Contracts', () => {
  it('prikazuje ugovore', () => { visit(); cy.contains('AAPL').should('be.visible'); });
  it('exercise dugme', () => {
    cy.intercept('POST', /\/otc\/contracts\/\d+\/exercise/, { statusCode: 200 });
    visit();
    cy.get('[data-testid="exercise-btn"]').should('be.visible').click();
  });
});
