// cypress/e2e/loan-flow.cy.ts
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const CLIENT = { email: 'c@b.com', role: 'Client', permissions: [] };
const ADMIN = { email: 'a@b.com', role: 'EmployeeAdmin', permissions: ['CLIENT_MANAGE'] };

function visit(url: string, user: object) {
  cy.visit(url, { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(user)); } });
}

describe('Loans', () => {
  it('klijent vidi listu kredita', () => {
    cy.intercept('GET', /\/loans/, { statusCode: 200, body: { content: [], totalElements: 0 } });
    visit('/loans', CLIENT);
    cy.contains(/kredit|loan/i).should('be.visible');
  });

  it('klijent — loan request', () => {
    visit('/loans/request', CLIENT);
    cy.contains(/iznos|amount/i).should('be.visible');
  });

  it('admin — loan management', () => {
    cy.intercept('GET', /\/loan/, { statusCode: 200, body: { content: [], totalElements: 0 } });
    visit('/loan-management', ADMIN);
    cy.contains(/aktivan|active/i, { matchCase: false }).should('be.visible');
  });
});
