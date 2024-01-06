// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ejs = require('ejs');
const app = express();

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number, // Allow float values for amount
  type: String, // 'income' or 'expense'
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.get('/', async (req, res) => {
  const transactions = await Transaction.find();
  const balance = calculateBalance(transactions);
  res.render('index', { transactions, balance });
});

app.post('/add-transaction', async (req, res) => {
  const { description, amount, type } = req.body;
  const newTransaction = new Transaction({ description, amount, type });
  await newTransaction.save();
  res.redirect('/');
});

const calculateBalance = (transactions) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return totalIncome - totalExpense;
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
