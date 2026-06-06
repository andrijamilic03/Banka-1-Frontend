// cypress/e2e/otc-full-negotiation.cy.ts
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const CLIENT = { email: 'c@b.com', role: 'Client', permissions: ['OTC_TRADE'] };

function visitOtc() {
  cy.intercept('GET', /\/otc\/offers\/active/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/api\/interbank\/otc\/negotiations/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/contracts\/my/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/otc\/public-stocks/, { statusCode: 200, body: [] });
  cy.intercept('GET', /\/stocks\/price-feed/, { statusCode: 200, body: [] });
  cy.visit('/otc', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT)); } });
}

describe('OTC Full Negotiation', () => {
  it('prikazuje OTC portal', () => { visitOtc(); cy.contains('OTC Portal', { timeout: 15000 }).should('be.visible'); });
  it('kreira ponudu', () => {
    cy.intercept('POST', /\/otc\/offers/, { statusCode: 201 });
    cy.visit('/otc/create', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT)); } });
    cy.contains('Nova OTC ponuda').should('be.visible');
  });
});
