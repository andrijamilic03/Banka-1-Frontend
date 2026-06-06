// cypress/e2e/activate-account.cy.ts
describe('Activate Account', () => {
  it('bez tokena → greška', () => {
    cy.visit('/auth/activate-account');
    cy.contains('Nevalidan link').should('be.visible');
  });

  it('employee — validan token → forma', () => {
    cy.intercept('GET', /\/employees\/auth\/checkActivate/, { statusCode: 200 }).as('check');
    cy.visit('/auth/activate-account?token=ok');
    cy.wait('@check');
    cy.contains('Aktivirajte nalog').should('be.visible');
  });

  it('employee — aktivacija uspešna', () => {
    cy.intercept('GET', /\/employees\/auth\/checkActivate/, { statusCode: 200 }).as('check');
    cy.intercept('POST', /\/employees\/auth\/activate/, { statusCode: 200 }).as('activate');
    cy.visit('/auth/activate-account?token=ok');
    cy.wait('@check');
    cy.get('input[name="password"]').type('Pass123!');
    cy.get('input[name="confirmPassword"]').type('Pass123!');
    cy.contains(/Aktiviraj nalog/i).click();
    cy.wait('@activate');
  });
});
