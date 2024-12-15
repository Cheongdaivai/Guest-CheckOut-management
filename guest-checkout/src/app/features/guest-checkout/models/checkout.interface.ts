export interface CheckoutForm {
  guestName: string;
  roomNumber: string;
  miniBar: boolean;
  houseKeeping: boolean;
  billPaid: boolean;
  keyReturned: boolean;
}

export interface CheckoutRecord extends CheckoutForm {
  checkoutTime: Date;
  status: 'Completed' | 'Pending';
} 