const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  guestName: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  miniBar: {
    type: Boolean,
    default: false
  },
  houseKeeping: {
    type: Boolean,
    default: false
  },
  billPaid: {
    type: Boolean,
    default: false
  },
  keyReturned: {
    type: Boolean,
    default: false
  },
  isLateCheckout: {
    type: Boolean,
    default: false
  },
  checkoutTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['VIP', 'Superior', 'Classic'],
    default: 'Classic'
  },
  lateFee: {
    type: Number,
    default: 0
  }
});

checkoutSchema.index({ priority: 1, checkoutTime: -1 });
checkoutSchema.index({ guestName: 1 });
checkoutSchema.index({ roomNumber: 1 });
checkoutSchema.index({ status: 1 });

module.exports = mongoose.model('Checkout', checkoutSchema); 