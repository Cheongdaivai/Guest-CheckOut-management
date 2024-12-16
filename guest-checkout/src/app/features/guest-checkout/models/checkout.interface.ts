export type PriorityLevel = 'VIP' | 'Superior' | 'Classic';

export interface CheckoutForm {
  guestName: string;
  roomNumber: string;
  miniBar: boolean;
  houseKeeping: boolean;
  billPaid: boolean;
  keyReturned: boolean;
  isLateCheckout: boolean;
  checkoutTime?: Date;
  priority: PriorityLevel;
}

export interface CheckoutRecord extends CheckoutForm {
  _id: string;
  checkoutTime: Date;
  status: 'Completed' | 'Pending';
  lateFee?: number;
} 