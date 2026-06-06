// cypress/e2e/account-list.cy.ts
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const CLIENT = { email: 'c@b.com', role: 'Client', permissions: ['BANKING_BASIC'] };
const ACCOUNTS = { content: [
  { id: 1, accountNumber: '111222333444555666', nazivRacuna: 'Tekući', currency: 'RSD', raspolozivoStanje: 50000, stanjeRacuna: 50000, status: 'ACTIVE' },
], totalElements: 1 };

describe('Account List', () => {
  it('prikazuje listu računa', () => {
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCOUNTS }).as('a');
    cy.visit('/home/accounts', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(CLIENT)); } });
    cy.wait('@a');
    cy.contains('Tekući').should('be.visible');
  });
});
