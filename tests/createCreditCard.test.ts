import {describe, expect, test} from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';

jest.mock('../src/creditCardsModel', () => {
  return {
    __esModule: true,
    insertCreditCard: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('../src/db', () => {
  return {
    __esModule: true,
    createConnection: jest.fn(() => Promise.resolve({ close: () => Promise.resolve() })),
  };
});

const { insertCreditCard } = require('../src/creditCardsModel');
afterEach(() => {
  jest.clearAllMocks();
});

describe('Create credit card tests', () => {
  test('Should respond with 200 HTTP status code', async () => {
    const creditCard = {
      name: 'name',
      credit_limit: 10,
      card_number: '8764313490142324',
      card_type: 'visa'
    };
    const response = await request(app)
      .post('/api/v1/credit_cards')
      .send(creditCard);
    expect(response.status).toBe(200);
    expect(insertCreditCard).toHaveBeenCalledWith(creditCard, expect.anything());
    expect(insertCreditCard.mock.calls.length).toBe(1);
  });
  test('Should respond with 403 because of invalid name', async () => {
    const creditCard = {
      name: '',
      credit_limit: 10,
      card_number: '8764313490142324',
      card_type: 'visa'
    };
    const response = await request(app)
      .post('/api/v1/credit_cards')
      .send(creditCard);
    expect(response.status).toBe(403);
    expect(insertCreditCard.mock.calls.length).toBe(0);
  });
  test('Should respond with 403 because of invalid card number', async () => {
    const creditCard = {
      name: '',
      credit_limit: 10,
      card_number: 'short',
      card_type: 'visa'
    };
    const response = await request(app)
      .post('/api/v1/credit_cards')
      .send(creditCard);
    expect(response.status).toBe(403);
    expect(insertCreditCard.mock.calls.length).toBe(0);
  });
  test('Should respond with 403 because of invalid card limit', async () => {
    const creditCard = {
      name: '',
      credit_limit: -2,
      card_number: '8764313490142324',
      card_type: 'visa'
    };
    const response = await request(app)
      .post('/api/v1/credit_cards')
      .send(creditCard);
    expect(response.status).toBe(403);
    expect(insertCreditCard.mock.calls.length).toBe(0);
  });
  test('Should respond with 403 because of invalid card card type', async () => {
    const creditCard = {
      name: '',
      credit_limit: 10,
      card_number: '8764313490142324',
      card_type: 'visa_invalid'
    };
    const response = await request(app)
      .post('/api/v1/credit_cards')
      .send(creditCard);
    expect(response.status).toBe(403);
    expect(insertCreditCard.mock.calls.length).toBe(0);
  });
});