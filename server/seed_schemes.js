const mongoose = require('mongoose');
const Scheme = require('./models/Scheme.model');
const db = require('./config/mongoose');

const sampleSchemes = [
  {
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    description: "Financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
    eligibility: {
      district: ["All"],
      minFarmSize: 0,
      maxFarmSize: 100,
      crops: ["Wheat", "Cotton", "Rice"],
      roles: ["farmer"]
    },
    benefits: "Comprehensive insurance cover against crop failure.",
    documentsRequired: ["Aadhaar", "Land Records", "Bank Passbook"],
    subsidyPercentage: 50,
    isActive: true
  },
  {
    title: "Kisan Credit Card (KCC)",
    description: "Provide adequate and timely credit support from the banking system via a single window.",
    eligibility: {
      district: ["All"],
      minFarmSize: 0,
      maxFarmSize: 50,
      crops: ["Any"],
      roles: ["farmer"]
    },
    benefits: "Credit limit for ancillary agricultural needs.",
    documentsRequired: ["Aadhaar", "Pan Card"],
    subsidyPercentage: 5,
    isActive: true
  },
  {
    title: "Gujarat Solar Power Policy for Farmers",
    description: "Subsidy for setting up small solar power plants in farm fields.",
    eligibility: {
      district: ["Ahmedabad", "Surat", "Rajkot"],
      minFarmSize: 1,
      maxFarmSize: 10,
      crops: ["Any"],
      roles: ["farmer"]
    },
    benefits: "Solar pump subsidy up to 80%.",
    documentsRequired: ["Land Records", "Passport Photo"],
    subsidyPercentage: 80,
    isActive: true
  }
];

async function seed() {
  try {
    await Scheme.deleteMany({});
    await Scheme.insertMany(sampleSchemes);
    console.log("Sample schemes seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
