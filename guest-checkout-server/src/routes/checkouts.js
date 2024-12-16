const express = require('express');
const router = express.Router();
const Checkout = require('../models/checkout');

// Get all checkouts
router.get('/', async (req, res) => {
  try {
    // Sort by priority (VIP first, then Superior, then Classic)
    // For same priority, sort by checkout time (newest first)
    const checkouts = await Checkout.find().sort({ 
      priority: 1, // 1 for ascending because VIP < Superior < Classic
      checkoutTime: -1 
    });
    res.json(checkouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new checkout
router.post('/', async (req, res) => {
  const checkout = new Checkout({
    ...req.body,
    // Calculate late fee if it's a late checkout
    lateFee: req.body.isLateCheckout ? calculateLateFee(req.body.checkoutTime) : 0
  });

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
    // If updating checkout time and it's a late checkout, recalculate late fee
    const updates = { ...req.body };
    if (updates.checkoutTime && updates.isLateCheckout) {
      updates.lateFee = calculateLateFee(updates.checkoutTime);
    }

    const checkout = await Checkout.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(checkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Helper function to calculate late fee
function calculateLateFee(checkoutTime) {
  const standardCheckoutTime = new Date(checkoutTime);
  standardCheckoutTime.setHours(11, 0, 0); // Standard checkout time is 11:00 AM

  if (new Date(checkoutTime) > standardCheckoutTime) {
    const hoursDiff = Math.ceil(
      (new Date(checkoutTime).getTime() - standardCheckoutTime.getTime()) / (1000 * 60 * 60)
    );
    return hoursDiff * 50; // $50 per hour after 11:00 AM
  }
  return 0;
}

module.exports = router; 