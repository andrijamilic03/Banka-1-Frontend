// cypress/e2e/employee-management.cy.ts
const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const ADMIN = { email: 'a@b.com', role: 'EmployeeAdmin', permissions: ['EMPLOYEE_MANAGE_ALL'] };

function visit(url: string) {
  cy.visit(url, { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(ADMIN)); } });
}

describe('Employee Management', () => {
  it('admin vidi listu zaposlenih', () => {
    cy.intercept({ method: 'GET', url: /\/employees\b/ }, (req) => {
      if (req.resourceType === 'xhr' || req.resourceType === 'fetch') req.reply({ statusCode: 200, body: { content: [], totalElements: 0 } });
      else req.continue();
    });
    visit('/employees');
    cy.contains('Zaposleni').should('be.visible');
  });

  it('admin pristupa /clients', () => {
    cy.intercept('GET', /\/clients\b/, { statusCode: 200, body: { content: [{ id: 1, ime: 'Marko', prezime: 'M', email: 'm@t.com' }], totalElements: 1 } });
    visit('/clients');
    cy.contains('Marko').should('be.visible');
  });
});
