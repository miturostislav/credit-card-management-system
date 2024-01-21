import {describe, expect, test} from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';

let creditCardFound = true;
let rejectTransaction = false;
let creditCard = null;
jest.mock('../src/creditCardsModel', () => {
  return {
    __esModule: true,
    findCreditCardByNumber: jest.fn(() => Promise.resolve(creditCard)),
    updateCreditLimit: jest.fn(() => Promise.resolve(creditCardFound)),
  };
});

jest.mock('../src/db', () => {
  return {
    __esModule: true,
    createConnection: jest.fn(() => Promise.resolve({ close: () => Promise.resolve() })),
  };
});

jest.mock('../src/paymentGatewayClient', () => {
  return {
    __esModule: true,
    charge: jest.fn(() => Promise[rejectTransaction ? 'reject' : 'resolve']()),
  };
});

const { findCreditCardByNumber, updateCreditLimit } = require('../src/creditCardsModel');
const { charge } = require('../src/paymentGatewayClient');
beforeEach(() => {
  creditCardFound = true;
  rejectTransaction = false;
  creditCard = {
    'id': 3,
    'name': 'SAMPLE',
    'credit_limit': 78,
    'card_number': '8764323432342324',
    'card_type': 'mastercard'
  };
});
afterEach(() => {
  jest.clearAllMocks();
});

describe('Charge credit card tests', () => {
  test('Should respond with 200 HTTP status code and charge credit card successfully', async () => {
    const amount = 43;
    const cardNumber = '8764313490142324';
    const response = await request(app)
      .post(`/api/v1/credit_cards/${cardNumber}/charge`)
      .send({ amount });
    expect(response.status).toBe(200);
    expect(updateCreditLimit).toHaveBeenCalledWith({ id: creditCard.id, credit_limit: creditCard.credit_limit - amount }, expect.anything());
    expect(updateCreditLimit.mock.calls.length).toBe(1);
    expect(findCreditCardByNumber).toHaveBeenCalledWith(cardNumber, expect.anything());
    expect(findCreditCardByNumber.mock.calls.length).toBe(1);
    expect(charge).toHaveBeenCalledWith(cardNumber, amount);
    expect(charge.mock.calls.length).toBe(1);
  });
  test('Should respond with 400 HTTP status code because of not enough credit', async () => {
    const amount = 43;
    const cardNumber = '8764313490142324';
    creditCard.credit_limit = amount - 5;
    const response = await request(app)
      .post(`/api/v1/credit_cards/${cardNumber}/charge`)
      .send({ amount });
    expect(response.status).toBe(400);
    expect(updateCreditLimit.mock.calls.length).toBe(0);
    expect(findCreditCardByNumber).toHaveBeenCalledWith(cardNumber, expect.anything());
    expect(findCreditCardByNumber.mock.calls.length).toBe(1);
    expect(charge.mock.calls.length).toBe(0);
  });
  test('Should respond with 500 HTTP status code because of payment gateway failure', async () => {
    rejectTransaction = true;
    const amount = 43;
    const cardNumber = '8764313490142324';
    const response = await request(app)
      .post(`/api/v1/credit_cards/${cardNumber}/charge`)
      .send({ amount });
    expect(response.status).toBe(500);
    expect(updateCreditLimit.mock.calls.length).toBe(0);
    expect(findCreditCardByNumber).toHaveBeenCalledWith(cardNumber, expect.anything());
    expect(findCreditCardByNumber.mock.calls.length).toBe(1);
    expect(charge).toHaveBeenCalledWith(cardNumber, amount);
    expect(charge.mock.calls.length).toBe(1);
  });
  test('Should respond with 404 HTTP status code because of credit card couldnt be found', async () => {
    creditCard = null;
    const amount = 43;
    const cardNumber = '8764313490142324';
    const response = await request(app)
      .post(`/api/v1/credit_cards/${cardNumber}/charge`)
      .send({ amount });
    expect(response.status).toBe(404);
    expect(updateCreditLimit.mock.calls.length).toBe(0);
    expect(findCreditCardByNumber).toHaveBeenCalledWith(cardNumber, expect.anything());
    expect(findCreditCardByNumber.mock.calls.length).toBe(1);
    expect(charge.mock.calls.length).toBe(0);
  });
  test('Should respond with 403 HTTP status code because of invalid card number', async () => {
    const amount = 43;
    const cardNumber = 'invalid';
    const response = await request(app)
      .post(`/api/v1/credit_cards/${cardNumber}/charge`)
      .send({ amount });
    expect(response.status).toBe(403);
    expect(updateCreditLimit.mock.calls.length).toBe(0);
    expect(findCreditCardByNumber.mock.calls.length).toBe(0);
    expect(charge.mock.calls.length).toBe(0);
  });
  test('Should respond with 403 HTTP status code because of invalid amount', async () => {
    const amount = -43;
    const cardNumber = '8764313490142324';
    const response = await request(app)
      .post(`/api/v1/credit_cards/${cardNumber}/charge`)
      .send({ amount });
    expect(response.status).toBe(403);
    expect(updateCreditLimit.mock.calls.length).toBe(0);
    expect(findCreditCardByNumber.mock.calls.length).toBe(0);
    expect(charge.mock.calls.length).toBe(0);
  });
});