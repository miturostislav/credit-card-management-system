import {describe, expect, test} from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';

let creditCardFound = true

jest.mock('../src/creditCardsModel', () => {
  return {
    __esModule: true,
    deleteCreditCard: jest.fn(() => Promise.resolve(creditCardFound)),
  };
});

jest.mock('../src/db', () => {
  return {
    __esModule: true,
    createConnection: jest.fn(() => Promise.resolve({ close: () => Promise.resolve() })),
  };
});

const { deleteCreditCard } = require('../src/creditCardsModel');
beforeEach(() => {
  creditCardFound = true
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('Delete credit card tests', () => {
  test('Should respond with 200 HTTP status code', async () => {
    const response = await request(app)
      .delete('/api/v1/credit_cards/3');
    expect(response.status).toBe(200);
    expect(deleteCreditCard).toHaveBeenCalledWith(3, expect.anything());
    expect(deleteCreditCard.mock.calls.length).toBe(1);
  });
  test('Should respond with 403 HTTP status code because of invalid id', async () => {
    const response = await request(app)
      .delete('/api/v1/credit_cards/invalid_id');
    expect(response.status).toBe(403);
    expect(deleteCreditCard.mock.calls.length).toBe(0);
  });
  test('Should respond with 404 HTTP status code because credit card coudnt be found', async () => {
    creditCardFound = false;
    const response = await request(app)
      .delete('/api/v1/credit_cards/3');
    expect(response.status).toBe(404);
    expect(deleteCreditCard.mock.calls.length).toBe(1);
  });
});