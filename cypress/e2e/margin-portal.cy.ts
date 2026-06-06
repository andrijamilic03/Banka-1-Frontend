// cypress/e2e/margin-portal.cy.ts
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const CLIENT = { email: 'c@b.com', role: 'Client', permissions: [] };

describe('Margin Portal', () => {
  beforeEach(() => {
    cy.intercept('GET', /\/accounts\/getMarginUser/, {
      statusCode: 200,
      body: { accountNumber: '5550001000000000001', userId: 77, initialMargin: 50000, loanValue: 0, maintenanceMargin: 25000, active: true },
    }).as('getAccount');
    cy.intercept('GET', /\/transactions\/getAllMarginTransactions/, { statusCode: 200, body: [] }).as('getTx');
  });

  it('prikazuje maržni račun', () => {
    cy.visit('/margin', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT)); } });
    cy.wait(['@getAccount', '@getTx']);
    cy.contains('Aktivan').should('be.visible');
  });

  it('add to margin', () => {
    cy.intercept('POST', /\/transactions\/addToMargin/, { statusCode: 200 }).as('add');
    cy.visit('/margin', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT)); } });
    cy.wait(['@getAccount', '@getTx']);
    cy.get('[data-testid=margin-add-amount]').type('10000');
    cy.get('[data-testid=margin-add-submit]').click();
    cy.wait('@add');
  });
});
