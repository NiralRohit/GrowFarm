const mongoose = require('mongoose');
const Bill = require('./models/Bill.model');
const Loan = require('./models/Loan.model');

mongoose.connect('mongodb://localhost:27017/growfarm', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    try {
      // Find a real user in the DB
      const User = require('./models/User.model');
      const user = await User.findOne({});
      if (!user) {
        console.log("No user found.");
        process.exit();
      }
      console.log('Testing with user:', user._id);
      
      const query = { $or: [{ farmer: user._id }, { trader: user._id }] };
      const bills = await Bill.find(query).populate('trader', 'fullName phone').populate('farmer', 'fullName phone').sort({ transactionDate: -1 });
      const loans = await Loan.find({ farmer: user._id }).sort({ sanctionDate: -1 });
      
      console.log('Bills length:', bills.length);
      console.log('Loans length:', loans.length);
      
      // JSON.stringify to see if it throws circular structure error
      JSON.stringify({ bills, loans });
      console.log('Success stringify!');
      
    } catch (err) {
      console.error('ERROR:', err);
    }
    process.exit();
  });
