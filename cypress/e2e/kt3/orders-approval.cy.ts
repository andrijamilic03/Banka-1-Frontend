// cypress/e2e/kt3/orders-approval.cy.ts
// KT3 — Pregled ordera (standalone — dvostepeni pristup)

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const SUPERVISOR = { email: 's@b.com', role: 'Supervisor', permissions: ['TRADE_UNLIMITED'] };

const ORDERS = {
  content: [
    { orderId: 1, agentName: 'Petar Petrović', orderType: 'MARKET', listingType: 'STOCK', quantity: 10, contractSize: 1, pricePerUnit: 185.5, direction: 'BUY', remainingPortions: 10, status: 'PENDING' },
    { orderId: 2, agentName: 'Ana Anić', orderType: 'LIMIT', listingType: 'STOCK', quantity: 5, contractSize: 1, pricePerUnit: 420.0, direction: 'SELL', remainingPortions: 5, status: 'PENDING' },
    { orderId: 3, agentName: 'Jovan Jovanović', orderType: 'STOP', listingType: 'FUTURES', quantity: 3, contractSize: 10, pricePerUnit: 19000.0, direction: 'BUY', remainingPortions: 3, status: 'APPROVED' },
  ],
  totalElements: 3, totalPages: 1, number: 0, size: 10,
};

function initAngular() {
  cy.intercept('GET', /\/order\/actuaries\/agents/, { statusCode: 200, body: { content: [], totalElements: 0 } });
  cy.visit('/actuary-management', {
    onBeforeLoad(win: any) {
      win.localStorage.setItem('authToken', TOKEN);
      win.localStorage.setItem('loggedUser', JSON.stringify(SUPERVISOR));
    },
  });
  cy.contains('h1', 'Aktuar Management', { timeout: 15000 }).should('be.visible');
}

function visitOrders() {
  cy.intercept('GET', /\/order\/orders/, { statusCode: 200, body: ORDERS }).as('getOrders');
  cy.visit('/orders-overview');
  cy.wait('@getOrders');
  cy.contains('h1', 'Pregled ordera', { timeout: 15000 }).should('be.visible');
}

describe('KT3 — Pregled ordera', () => {
  before(() => { initAngular(); });

  it('Prikazuje tabelu sa orderima', () => {
    visitOrders();
    cy.contains('td', 'Petar Petrović').should('be.visible');
    cy.contains('td', 'Ana Anić').should('be.visible');
  });

  it('Filtrira — Pending', () => {
    visitOrders();
    cy.contains('button', 'Pending').click();
    cy.wait('@getOrders');
    cy.contains('td', 'Jovan Jovanović').should('not.exist');
  });

  it('Filtrira — Approved', () => {
    visitOrders();
    cy.contains('button', 'Approved').click();
    cy.wait('@getOrders');
    cy.contains('td', 'Jovan Jovanović').should('be.visible');
    cy.contains('td', 'Petar Petrović').should('not.exist');
  });

  it('Approve order', () => {
    cy.intercept('PUT', /\/order\/orders\/\d+\/approve/, { statusCode: 200 }).as('approve');
    visitOrders();
    cy.contains('tr', 'Petar Petrović').within(() => cy.contains('button', 'Approve').click());
    cy.wait('@approve');
    cy.wait('@getOrders');
  });

  it('Decline order', () => {
    cy.intercept('PUT', /\/order\/orders\/\d+\/decline/, { statusCode: 200 }).as('decline');
    visitOrders();
    cy.contains('tr', 'Ana Anić').within(() => cy.contains('button', 'Decline').click());
    cy.wait('@decline');
    cy.wait('@getOrders');
  });

  it('Dijalog za otkazivanje', () => {
    visitOrders();
    cy.contains('tr', 'Jovan Jovanović').within(() => cy.get('[data-cy="cancel-order-btn"]').click());
    cy.contains('Otkazivanje naloga').should('be.visible');
    cy.contains('button', 'Potvrdi otkazivanje').should('be.visible');
  });
});
