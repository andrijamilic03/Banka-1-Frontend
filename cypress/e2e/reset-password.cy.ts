// cypress/e2e/reset-password.cy.ts
describe('Reset Password', () => {
  it('bez tokena → greška', () => {
    cy.visit('/auth/reset-password');
    cy.contains('Nevalidan link').should('be.visible');
  });

  it('validan token → forma', () => {
    cy.intercept('GET', /\/employees\/auth\/checkResetPassword/, { statusCode: 200 }).as('check');
    cy.visit('/auth/reset-password?token=ok');
    cy.wait('@check');
    cy.contains('Postavite novu lozinku').should('be.visible');
  });

  it('reset uspešan', () => {
    cy.intercept('GET', /\/employees\/auth\/checkResetPassword/, { statusCode: 200 }).as('check');
    cy.intercept('POST', /\/employees\/auth\/resetPassword/, { statusCode: 200 }).as('reset');
    cy.visit('/auth/reset-password?token=ok');
    cy.wait('@check');
    cy.get('input[name="password"]').type('Pass123!');
    cy.get('input[name="confirmPassword"]').type('Pass123!');
    cy.contains(/Resetuj lozinku/i).click();
    cy.wait('@reset');
  });
});
