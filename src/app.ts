import express from 'express';
import { 
  createCreditCardHandler,
  getCreditCardsHandler,
  getCreditCardHandler,
  updateCreditCardHandler,
  deleteCreditCardHandler,
  chargeCreditCardHandler,
  creditCreditCardHandler,
} from './creditCardsHandlers';

export const app = express();
const port = 3000;

app.use(express.json())
app.post('/api/v1/credit_cards', createCreditCardHandler);
app.get('/api/v1/credit_cards', getCreditCardsHandler);
app.get('/api/v1/credit_cards/:cardId', getCreditCardHandler);
app.put('/api/v1/credit_cards/:cardId', updateCreditCardHandler);
app.delete('/api/v1/credit_cards/:cardId', deleteCreditCardHandler)
app.post('/api/v1/credit_cards/:cardNumber/charge', chargeCreditCardHandler);
app.post('/api/v1/credit_cards/:cardNumber/credit', creditCreditCardHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
  });
}
