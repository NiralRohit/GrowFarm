const Bill = require('../models/Bill.model');
const Loan = require('../models/Loan.model');
const Profile = require('../models/Profile.model');

/**
 * Get farmer's billing & loan history
 */
exports.getBills = async (req, res) => {
  try {
    const query = { $or: [{ farmer: req.user._id }, { trader: req.user._id }] };
    const bills = await Bill.find(query).populate('trader', 'fullName phone').populate('farmer', 'fullName phone').sort({ transactionDate: -1 });
    const loans = await Loan.find({ farmer: req.user._id }).sort({ sanctionDate: -1 });
    res.status(200).json({ bills, loans });
  } catch (error) {
    require('fs').writeFileSync('billing_error.log', error.stack || error.message);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

/**
 * Get farmer's loan summary
 */
exports.getLoanSummary = async (req, res) => {
  try {
    const query = { $or: [{ farmer: req.user._id }, { trader: req.user._id }] };
    const bills = await Bill.find(query);
    const loans = await Loan.find({ farmer: req.user._id, status: 'active' });
    
    const totalSales = bills.reduce((sum, b) => sum + (b.netPayable || 0), 0);
    const totalTransactions = bills.length;
    const activeLoanCount = loans.length;
    const totalLoanAmount = loans.reduce((sum, l) => sum + (l.principal || 0), 0);
    const outstandingBalance = loans.reduce((sum, l) => sum + (l.outstanding || 0), 0);
    
    res.status(200).json({
      totalSales,
      totalTransactions,
      activeLoanCount,
      totalLoanAmount,
      outstandingBalance
    });
  } catch (error) {
    require('fs').writeFileSync('billing_error.log', error.stack || error.message);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};
