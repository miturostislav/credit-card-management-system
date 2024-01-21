import {describe, expect, test} from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';

const creditCards = [
  {
    'id': 3,
    'name': 'SAMPLE',
    'credit_limit': 78,
    'card_number': '8764323432342324',
    'card_type': 'mastercard'
  },
  {
    'id': 4,
    'name': 'SAMPLE2',
    'credit_limit': 120,
    'card_number': '8764323490342324',
    'card_type': 'visa'
  }
];
jest.mock('../src/creditCardsModel', () => {
  return {
    __esModule: true,
    findAllCreditCards: jest.fn(() => Promise.resolve(creditCards)),
    findCreditCardById: jest.fn(() => Promise.resolve(creditCards[0])),
  };
});

jest.mock('../src/db', () => {
  return {
    __esModule: true,
    createConnection: jest.fn(() => Promise.resolve({
      close: () => Promise.resolve(),
    })),
  };
});

const { findCreditCardById, findAllCreditCards } = require('../src/creditCardsModel');
afterEach(() => {
  jest.clearAllMocks();
});

describe('Get credit cards', () => {
  test('Should respond with 200 HTTP status code and the list of credit cards', async () => {
    const response = await request(app)
      .get('/api/v1/credit_cards');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(creditCards);
    expect(findAllCreditCards.mock.calls.length).toBe(1);
  });
  test('Should respond with 200 HTTP status code and the requested credit card', async () => {
    const response = await request(app)
      .get('/api/v1/credit_cards/3');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(creditCards[0]);
    expect(findCreditCardById.mock.calls.length).toBe(1);
  });
  test('Should respond with 403 200 HTTP status code because of invalid id', async () => {
    const response = await request(app)
      .get('/api/v1/credit_cards/invalid_id');
    expect(response.status).toBe(403);
    expect(findCreditCardById.mock.calls.length).toBe(0);
  });
});