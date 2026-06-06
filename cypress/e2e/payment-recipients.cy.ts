// cypress/e2e/payment-recipients.cy.ts
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const CLIENT = { email: 'c@b.com', role: 'Client', permissions: ['BANKING_BASIC'] };
const RECIPIENTS = [
  { id: 1, name: 'Pera Perić', accountNumber: '265000000923124323' },
  { id: 2, name: 'Maja Nikolić', accountNumber: '265000000923124325' },
];

describe('Payment Recipients', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: { content: [] } });
    cy.intercept('GET', /\/payments\/recipients/, { statusCode: 200, body: { content: RECIPIENTS } }).as('rec');
    cy.visit('/payments/recipients', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT)); } });
    cy.wait('@rec');
  });

  it('prikazuje primaоce', () => { cy.contains('Pera Perić').should('be.visible'); cy.contains('Maja Nikolić').should('be.visible'); });
  it('dugme DODAJ', () => { cy.contains('button', /DODAJ/i).should('be.visible'); });
  it('bez tokena → /login', () => { cy.visit('/payments/recipients', { onBeforeLoad(win: any) { win.localStorage.clear(); } }); cy.url().should('include', '/login'); });
});
