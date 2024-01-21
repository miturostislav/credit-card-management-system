import {describe, expect, test} from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';

let creditCardFound = true
jest.mock('../src/creditCardsModel', () => {
  return {
    __esModule: true,
    updateCreditLimit: jest.fn(() => Promise.resolve(creditCardFound)),
  };
});

jest.mock('../src/db', () => {
  return {
    __esModule: true,
    createConnection: jest.fn(() => Promise.resolve({ close: () => Promise.resolve() })),
  };
});

const { updateCreditLimit } = require('../src/creditCardsModel');
beforeEach(() => {
  creditCardFound = true
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('Update credit card tests', () => {
  test('Should respond with 200 HTTP status code', async () => {
    const creditCard = {
      credit_limit: 10
    };
    const response = await request(app)
      .put('/api/v1/credit_cards/3')
      .send(creditCard);
    expect(response.status).toBe(200);
    expect(updateCreditLimit).toHaveBeenCalledWith({ id: 3, ...creditCard }, expect.anything());
    expect(updateCreditLimit.mock.calls.length).toBe(1);
  });
  test('Should respond with 403 HTTP status code because of invalid id', async () => {
    const creditCard = {
      credit_limit: 10
    };
    const response = await request(app)
      .put('/api/v1/credit_cards/invalid_id')
      .send(creditCard);
    expect(response.status).toBe(403);
    expect(updateCreditLimit.mock.calls.length).toBe(0);
  });
  test('Should respond with 403 HTTP status code because of invalid card limit', async () => {
    const creditCard = {
      credit_limit: -5
    };
    const response = await request(app)
      .put('/api/v1/credit_cards/3')
      .send(creditCard);
    expect(response.status).toBe(403);
    expect(updateCreditLimit.mock.calls.length).toBe(0);
  });
  test('Should respond with 404 HTTP status code because credit card coudnt be found', async () => {
    creditCardFound = false
    const creditCard = {
      credit_limit: 5
    };
    const response = await request(app)
      .put('/api/v1/credit_cards/3')
      .send(creditCard);
    expect(response.status).toBe(404);
    expect(updateCreditLimit.mock.calls.length).toBe(1);
  });
});