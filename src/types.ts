export interface CreditCard {
  id?: number;
  name: string;
  credit_limit: number;
  card_number: string;
  card_type: 'visa' | 'mastercard';
}