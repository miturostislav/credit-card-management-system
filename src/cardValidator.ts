import Validator from 'fastest-validator';

const validator = new Validator();
const creditCardName = {
  name: {
    type: 'string',
    min: 2,
    max: 60,
    messages: {
      string: 'Please check your firstname',
      stringMin: 'Your name is too short',
      stringMax: 'Your name is too long'
    }
  }
};
const creditCardType = {
  card_type: {
    type: 'enum',
    values: ['mastercard', 'visa'],
    min: 2,
    max: 60,
    messages: {
      enum: 'Only mastercard and visa are valid card types',
    }
  }
};
const creditCardNumber = {
  card_number: {
    type: 'string',
    length: 16,
    messages: {
      string: 'Please check credit card number',
      stringLength: 'Please check credit card number',
    }
  }
};
const creditCardLimit = {
  credit_limit: {
    type: 'number',
    positive: true,
    integer: true,
    messages: {
      number: 'Please check your credit limit',
      numberPositive: 'Credit limit can not be negative'
    }
  }
};
const amount = {
  amount: {
    type: 'number',
    positive: true,
    integer: true,
    messages: {
      number: 'Please check your credit limit',
      numberPositive: 'Credit limit can not be negative'
    }
  }
}
const creditCardId = {
  id: {
    type: 'number',
    positive: true,
    integer: true,
    messages: {
      number: 'Invalid credit card id',
    }
  }
}

export const validateCreditCard = validator.compile({ ...creditCardName, ...creditCardType, ...creditCardNumber, ...creditCardLimit });
export const validateCreditCardLimit = validator.compile({ ...creditCardLimit, ...creditCardId });
export const validateCreditCardId = validator.compile({ ...creditCardId });
export const validateCharge = validator.compile({ ...creditCardNumber, ...amount });
