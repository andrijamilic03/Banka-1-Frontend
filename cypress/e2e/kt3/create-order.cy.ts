// cypress/e2e/kt3/create-order.cy.ts
// KT3 — Kreiranje naloga (pravi login flow za standalone)

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.mock';

const SEC = { listingId: 42, ticker: 'AAPL', name: 'Apple Inc.', exchangeMICCode: 'NASDAQ', price: 185.5, currency: 'USD', listingType: 'STOCK', bid: 185.4, ask: 185.6, change: 0, changePercent: 0, volume: 1000000, maintenanceMargin: 0, initialMarginCost: 0, lastRefresh: '2026-06-01', contractSize: 1 };
const ACCTS = { content: [{ id: 101, accountNumber: '111-0001', nazivRacuna: 'USD', currency: 'USD', raspolozivoStanje: 50000, stanjeRacuna: 50000, status: 'ACTIVE' }] };
const DRAFT = { id: 999, ticker: 'AAPL', orderType: 'MARKET', direction: 'BUY', quantity: 5, pricePerUnit: 185.5, approximatePrice: 927.5, fee: 7.0, allOrNone: false, margin: false, exchangeClosed: false, afterHours: false };

function loginViaUI() {
  cy.intercept('POST', /\/employees\/auth\/login/, {
    statusCode: 200,
    body: { jwt: TOKEN, refreshToken: 'ref', role: 'EmployeeAdmin', permissions: ['EMPLOYEE_MANAGE_ALL'] },
  }).as('empLogin');

  cy.visit('/login');
  cy.contains('button', 'Zaposleni').click();
  cy.get('[data-cy="email"]').type('c@b.com');
  cy.get('[data-cy="password"]').type('pass');
  cy.get('[data-cy="login-btn"]').click();
  cy.wait('@empLogin');
  // Token je sačuvan u localStorage kroz tap() pre navigacije
}

const q = () => cy.contains('label', 'Količina').siblings('input').first();
const l = () => cy.contains('label', 'Limit vrednost').siblings('input').first();
const s = () => cy.contains('label', 'Stop vrednost').siblings('input').first();

describe('KT3 — Create Order', () => {
  before(() => { loginViaUI(); });

  it('Sc. 24: količina 0', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.visit('/orders/create/BUY/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    q().clear().type('0');
    cy.contains('button', 'Nastavi na potvrdu').should('be.disabled');
  });

  it('Sc. 26: MARKET', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.visit('/orders/create/BUY/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    q().should('exist'); l().should('exist'); s().should('exist');
    cy.contains('span', 'Order Type').siblings('strong').should('contain', 'MARKET');
  });

  it('Sc. 29: LIMIT', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.visit('/orders/create/BUY/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    q().clear().type('5'); l().clear().type('180');
    cy.contains('span', 'Order Type').siblings('strong').should('contain', 'LIMIT');
  });

  it('Sc. 30: STOP', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.visit('/orders/create/BUY/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    q().clear().type('5'); s().clear().type('190');
    cy.contains('span', 'Order Type').siblings('strong').should('contain', 'STOP');
  });

  it('Sc. 31: STOP_LIMIT', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.visit('/orders/create/BUY/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    q().clear().type('5'); s().clear().type('190'); l().clear().type('195');
    cy.contains('span', 'Order Type').siblings('strong').should('contain', 'STOP_LIMIT');
  });

  it('Sc. 33: dijalog potvrde', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.intercept('POST', /\/orders\/buy/, { statusCode: 200, body: DRAFT }).as('draft');
    cy.visit('/orders/create/BUY/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    q().clear().type('5');
    cy.get('select#create-order-account').select('101');
    cy.contains('button', 'Nastavi na potvrdu').click();
    cy.wait('@draft');
    cy.contains('Potvrda ordera').should('be.visible');
  });

  it('Sc. 36: SELL maks. dostupno', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.intercept('GET', /\/order\/portfolio/, { statusCode: 200, body: { holdings: [{ listingId: 42, ticker: 'AAPL', quantity: 10 }] } });
    cy.visit('/orders/create/SELL/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    cy.contains('Maks. dostupno za prodaju').should('be.visible');
  });

  it('Sc. 37: SELL prekoračenje', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.intercept('GET', /\/order\/portfolio/, { statusCode: 200, body: { holdings: [{ listingId: 42, ticker: 'AAPL', quantity: 10 }] } });
    cy.visit('/orders/create/SELL/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    q().clear().type('15');
    cy.contains('Ne možete prodati više nego što posedujete').should('be.visible');
  });

  it('Sc. 45: berza zatvorena', () => {
    cy.intercept('GET', /\/stock\/api\/listings\/42/, { statusCode: 200, body: SEC });
    cy.intercept('GET', /\/accounts\/client\/accounts/, { statusCode: 200, body: ACCTS });
    cy.intercept('POST', /\/orders\/buy/, { statusCode: 200, body: { ...DRAFT, exchangeClosed: true } }).as('draft');
    cy.visit('/orders/create/BUY/42');
    cy.contains('label', 'Količina', { timeout: 15000 }).should('be.visible');
    q().clear().type('5');
    cy.get('select#create-order-account').select('101');
    cy.contains('button', 'Nastavi na potvrdu').click();
    cy.wait('@draft');
    cy.contains('Berza je trenutno zatvorena').should('be.visible');
  });
});
