const express = require('express');
const router = express.Router();
const Checkout = require('../models/checkout');

// Get all checkouts
router.get('/', async (req, res) => {
  try {
    const checkouts = await Checkout.find().sort({ checkoutTime: -1 });
    res.json(checkouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new checkout
router.post('/', async (req, res) => {
  const checkout = new Checkout(req.body);
  try {
    const newCheckout = await checkout.save();
    res.status(201).json(newCheckout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update checkout
router.patch('/:id', async (req, res) => {
  try {
    const checkout = await Checkout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(checkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 