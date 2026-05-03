const Bill = require('../models/Bill.model');
const Loan = require('../models/Loan.model');
const InsurancePolicy = require('../models/InsurancePolicy.model');
const Notification = require('../models/Notification');
const User = require('../models/User.model');

exports.seedDemoData = async (req, res) => {
  try {
    const farmerId = req.user._id;
    const district = req.user.district || 'Rajkot';

    // 1. Seed Bills
    const existingBills = await Bill.countDocuments({ farmer: farmerId });
    if (existingBills === 0) {
      await Bill.create([
        {
          billNo: `APMC-${new Date().getFullYear()}-${farmerId.toString().substring(18)}-01`,
          farmer: farmerId,
          trader: farmerId, // Mocking trader as self for demo
          cropName: 'Groundnut',
          quantity: 25,
          unit: 'Quintal',
          rate: 5500,
          netPayable: 137500,
          grade: 'A',
          transactionDate: new Date('2026-03-15')
        },
        {
          billNo: `APMC-${new Date().getFullYear()}-${farmerId.toString().substring(18)}-02`,
          farmer: farmerId,
          trader: farmerId,
          cropName: 'Cotton',
          quantity: 40,
          unit: 'Quintal',
          rate: 6200,
          netPayable: 248000,
          grade: 'A',
          transactionDate: new Date('2026-02-28')
        }
      ]);
    }

    // 2. Seed Loans
    const existingLoans = await Loan.countDocuments({ farmer: farmerId });
    if (existingLoans === 0) {
      await Loan.create([
        {
          farmer: farmerId,
          title: 'Kisan Credit Card (KCC)',
          lender: 'State Bank of India',
          type: 'KCC',
          principal: 300000,
          interestRate: 4,
          tenure: 12,
          outstanding: 150000,
          status: 'active',
          sanctionDate: new Date('2025-06-01'),
          maturityDate: new Date('2026-06-01')
        },
        {
          farmer: farmerId,
          title: 'Crop Loan - Kharif 2025',
          lender: 'Bank of Baroda',
          type: 'Crop Loan',
          principal: 200000,
          interestRate: 7,
          tenure: 12,
          outstanding: 0,
          status: 'closed',
          sanctionDate: new Date('2025-04-15'),
          maturityDate: new Date('2026-04-15')
        }
      ]);
    }

    // 3. Seed Insurance
    const existingInsurance = await InsurancePolicy.countDocuments({ farmer: farmerId });
    if (existingInsurance === 0) {
      await InsurancePolicy.create([
        {
          user: farmerId,
          policyNumber: `INS-PMFBY-${new Date().getFullYear()}-${farmerId.toString().substring(18)}`,
          policyName: 'Pradhan Mantri Fasal Bima Yojana',
          provider: 'Agriculture Insurance Company of India',
          schemeName: 'PMFBY',
          cropsCovered: ['Groundnut', 'Cotton'],
          season: 'Kharif',
          coverageAmount: 200000,
          premiumAmount: 4000,
          subsidyPercentage: 50,
          farmerPremium: 2000,
          landArea: 5,
          surveyNo: '142/A',
          village: 'Rajkot',
          district: district,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          status: 'active'
        }
      ]);
    }

    // 4. Seed Notifications
    const existingNotifs = await Notification.countDocuments({ to: farmerId });
    if (existingNotifs === 0) {
      await Notification.create([
        {
          content: '🚨 Heavy rainfall alert for your district. Protect your crops and secure irrigation channels.',
          from: 'Weather Service',
          to: farmerId.toString(),
          time: new Date()
        },
        {
          content: '📢 New scheme available: PMFBY Kharif 2026 enrollment is now open. Apply before June 30, 2026.',
          from: 'Admin',
          to: farmerId.toString(),
          time: new Date(Date.now() - 86400000)
        }
      ]);
    }

    res.status(200).json({ message: "Demo data seeded successfully! 🚀" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
