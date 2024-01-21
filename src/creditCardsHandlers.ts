import { Request, Response } from 'express';
import { CreditCard } from './types';
import {
  validateCreditCard,
  validateCreditCardLimit,
  validateCreditCardId,
  validateCharge
} from './cardValidator';
import { 
  insertCreditCard,
  findAllCreditCards,
  findCreditCardById,
  updateCreditLimit,
  deleteCreditCard,
  findCreditCardByNumber
} from './creditCardsModel';
import * as PaymentGatewayClient from './paymentGatewayClient';
import { createConnection, DBConnection } from './db';
import { handlerError } from './helpers';

export async function createCreditCardHandler(req: Request, res: Response) {
  let db: DBConnection = null;
  try {
    const creditCard = {
      name: req.body.name,
      credit_limit: req.body.credit_limit,
      card_number: req.body.card_number,
      card_type: req.body.card_type,
    }
    const isValid = validateCreditCard(creditCard);

    if (isValid !== true) {
      res.status(403).send(isValid);
      return;
    }

    db = await createConnection();
    await insertCreditCard(creditCard, db);
    res.status(200).send({ message: 'Card has been added successfully' });
    await db.close();
  } catch (error) {
    await handlerError(res, db, error);
  }
}

export async function getCreditCardsHandler(req: Request, res: Response) {
  let db: DBConnection = null;
  try {
    db = await createConnection();
    const creditCards = await findAllCreditCards(db);
    res.status(200).send(creditCards);
    await db.close();
  } catch (error) {
    await handlerError(res, db, error);
  }
}

export async function getCreditCardHandler(req: Request, res: Response) {
  let db: DBConnection = null;
  try {
    const cardId = Number(req.params.cardId);
    const isValid = validateCreditCardId({ id: cardId });

    if (isValid !== true) {
      res.status(403).send(isValid);
      return;
    }

    db = await createConnection();
    const creditCard = await findCreditCardById(cardId, db);

    if (!creditCard) {
      res.status(404).send({ message: 'Credit card not found' });
      await db.close();
      return;
    }

    res.status(200).send(creditCard);
    await db.close();
  } catch (error) {
    await handlerError(res, db, error);
  }
}

export async function updateCreditCardHandler(req: Request, res: Response) {
  let db: DBConnection = null;
  try {
    const newCreditCard: Pick<CreditCard, 'id' | 'credit_limit'> = { id: Number(req.params.cardId), credit_limit: req.body.credit_limit };
    const isValid = validateCreditCardLimit(newCreditCard);

    if (isValid !== true) {
      res.status(403).send(isValid);
      return;
    }
    
    db = await createConnection();
    const updated = await updateCreditLimit(newCreditCard, db);

    if (!updated) {
      res.status(404).send({ message: 'Credit card not found' });
      await db.close();
      return;
    }

    res.status(200).send({ message: 'Card has been updated successfully' });
    await db.close();
    } catch (error) {
      await handlerError(res, db, error);
    }
}

export async function deleteCreditCardHandler(req: Request, res: Response) {
  let db: DBConnection = null;
  try {
    const cardId = Number(req.params.cardId);
    const isValid = validateCreditCardId({ id: cardId });

    if (isValid !== true) {
      res.status(403).send(isValid);
      return;
    }

    db = await createConnection();
    const deleted = await deleteCreditCard(cardId, db);

    if (!deleted) {
      res.status(404).send({ message: 'Credit card not found' });
      await db.close();
      return;
    }

    res.status(200).send({ message: 'Card has been deleted successfully' });
    await db.close();
  } catch (error) {
    await handlerError(res, db, error);
  }
}

// Probably we should acquire a lock for this cred card to avoid concurrent requests that might bypass our validation and cause errors
export async function chargeCreditCardHandler(req: Request, res: Response) {
  let db: DBConnection = null;
  try {
    const cardNumber = req.params.cardNumber;
    const amount = Number(req.body.amount);
    const isValid = validateCharge({ card_number: cardNumber, amount });

    if (isValid !== true) {
      res.status(403).send(isValid);
      return;
    }

    db = await createConnection();
    const creditCard = await findCreditCardByNumber(cardNumber, db);

    if (!creditCard) {
      res.status(404).send({ message: 'Credit card not found' });
      await db.close();
      return;
    }

    if (creditCard.credit_limit < amount) {
      res.status(400).send({ message: 'Not enough credit' });
      await db.close();
      return;
    }

    try {
      await PaymentGatewayClient.charge(cardNumber, amount);
    } catch (error) {
      res.status(500).send({ message: 'Transaction failed' });
      await db.close();
      return;
    }
    await updateCreditLimit({ id: creditCard.id, credit_limit: creditCard.credit_limit - amount }, db);

    res.status(200).send({ message: 'Card has been charged successfully' });
    await db.close();
  } catch (error) {
    await handlerError(res, db, error);
  }
}

// Probably we should acquire a lock for this cred card to avoid concurrent requests that might bypass our validation and cause errors
export async function creditCreditCardHandler(req: Request, res: Response) {
  let db: DBConnection = null;
  try {
    const cardNumber = req.params.cardNumber;
    const amount = Number(req.body.amount);
    const isValid = validateCharge({ card_number: cardNumber, amount });

    if (isValid !== true) {
      res.status(403).send(isValid);
      return;
    }

    db = await createConnection();
    const creditCard = await findCreditCardByNumber(cardNumber, db);

    if (!creditCard) {
      res.status(404).send({ message: 'Credit card not found' });
      await db.close();
      return;
    }

    // Probably these two operations should be wrapped in a transaction to avoid inconsistencies
    try {
      await PaymentGatewayClient.credit(cardNumber, amount);
    } catch (error) {
      res.status(500).send({ message: 'Transaction failed' });
      await db.close();
      return;
    }
    await updateCreditLimit({ id: creditCard.id, credit_limit: creditCard.credit_limit + amount }, db);

    res.status(200).send({ message: 'Card has been credited successfully' });
    await db.close();
  } catch (error) {
    await handlerError(res, db, error);
  }
}
