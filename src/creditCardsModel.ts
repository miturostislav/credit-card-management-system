import { CreditCard } from './types';
import { DBConnection } from './db';
import { encrypt, decrypt } from './helpers';

export async function insertCreditCard(creditCard: CreditCard, db: DBConnection): Promise<void> {
  return db.put({ ...creditCard, card_number: encrypt(creditCard.card_number) });
}

export async function findAllCreditCards(db: DBConnection): Promise<CreditCard[]> {
  return (await db.getAll<CreditCard>()).map((record) => ({ ...record, card_number: decrypt(record.card_number) }));
}

export async function findCreditCardById(id: number, db: DBConnection): Promise<CreditCard> {
  const creditCard = (await db.getById<CreditCard>(id));
  return creditCard ? { ...creditCard, card_number: decrypt(creditCard.card_number) } : null;
}

export async function findCreditCardByNumber(number: string, db: DBConnection): Promise<CreditCard> {
  const creditCard = (await db.getByColumn<CreditCard>('card_number', number, decrypt));
  return creditCard ? { ...creditCard, card_number: decrypt(creditCard.card_number) } : null;
}

export async function updateCreditLimit(creditCard: Pick<CreditCard, 'id' | 'credit_limit'>, db: DBConnection): Promise<boolean> {
  return db.updateById(creditCard)
}

export async function deleteCreditCard(cardId: number, db: DBConnection): Promise<boolean> {
  return db.deleteById(cardId);
}
