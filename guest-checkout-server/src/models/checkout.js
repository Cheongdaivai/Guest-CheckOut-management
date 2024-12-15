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
  checkoutTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Checkout', checkoutSchema); 