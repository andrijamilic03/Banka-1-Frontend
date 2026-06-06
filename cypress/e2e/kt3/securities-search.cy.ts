// cypress/e2e/kt3/securities-search.cy.ts
// KT3 — Hartije od vrednosti (bez beforeEach)

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';
const AGENT = { email: 'a@b.com', role: 'Agent', permissions: ['SECURITIES_TRADE_UNLIMITED'] };
const CLIENT = { email: 'c@b.com', role: 'Client', permissions: ['SECURITIES_TRADE_LIMITED'] };

const STOCKS = { content: [
  { id: 1, ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 185.5, volume: 1000000, change: 1.2, changePercent: 0.65 },
  { id: 2, ticker: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', price: 420.0, volume: 900000, change: -0.5, changePercent: -0.12 },
], totalElements: 2 };

function go(user: object) {
  cy.intercept('GET', /\/stock\/api\/listings\/stocks/, { statusCode: 200, body: STOCKS }).as('s');
  cy.intercept('GET', /\/stock\/api\/listings\/forex/, { statusCode: 200, body: { content: [] } });
  cy.intercept('GET', /\/stock\/api\/stock-exchanges/, { statusCode: 200, body: [] });
  cy.visit('/securities', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(user)); } });
  cy.wait('@s');
}

describe('KT3 — Hartije od vrednosti', () => {

  it('Aktuar vidi sve tabove', () => {
    go(AGENT);
    cy.contains('button', 'Akcije', { timeout: 15000 }).should('be.visible');
    cy.contains('button', 'Fjučersi').should('be.visible');
    cy.contains('button', 'Forex parovi').should('be.visible');
  });

  it('Klijent ne vidi Forex', () => {
    go(CLIENT);
    cy.contains('button', 'Akcije', { timeout: 15000 }).should('be.visible');
    cy.contains('button', 'Fjučersi').should('be.visible');
    cy.contains('button', 'Forex parovi').should('not.exist');
  });

  it('Pretraga MSFT', () => {
    go(AGENT);
    cy.contains('button', 'Akcije', { timeout: 15000 }).should('be.visible');
    cy.contains('AAPL').should('be.visible');
    cy.get('input[placeholder*="tikeru"]').should('be.visible').clear().type('MSFT');
    cy.contains('MSFT').should('be.visible');
  });

  it('Filter panel', () => {
    go(AGENT);
    cy.contains('button', 'Akcije', { timeout: 15000 }).should('be.visible');
    cy.contains('AAPL').should('be.visible');
    cy.contains('button', 'Filteri').click();
    cy.contains('label', 'Cena od').should('be.visible');
  });

  it('Detalji AAPL', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/AAPL/, { statusCode: 200, body: { ...STOCKS.content[0], history: [], exchangeMICCode: 'NASDAQ', bid: 185.4, ask: 185.6, change: 1.2, changePercent: 0.65, maintenanceMargin: 0, initialMarginCost: 0, contractSize: 1, lastRefresh: '2026-06-01', listingType: 'STOCK' } });
    cy.intercept('GET', /\/stock\/api\/stock-exchanges/, { statusCode: 200, body: [] });
    cy.visit('/securities/stock/AAPL', { onBeforeLoad(win: any) { win.localStorage.setItem('authToken', TOKEN); win.localStorage.setItem('loggedUser', JSON.stringify(AGENT)); } });
    cy.contains('AAPL', { timeout: 15000 }).should('be.visible');
  });
});
