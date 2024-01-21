import axios from 'axios';

const paymentGatewayUrl = 'http://localhost:3100/api/v1';
export async function charge(cardNumber: string, amount: number): Promise<any> {
  return await axios.post(`${paymentGatewayUrl}/charge`, { card_number: cardNumber, amount });
}

export async function credit(cardNumber: string, amount: number): Promise<any> {
  return await axios.post(`${paymentGatewayUrl}/charge`, { card_number: cardNumber, amount: -amount });
}