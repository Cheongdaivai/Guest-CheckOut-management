import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckoutForm, CheckoutRecord } from './models/checkout.interface';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { CheckoutService } from '../../services/checkout.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-guest-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './guest-checkout.component.html',
  styleUrls: ['./guest-checkout.component.css']
})
export class GuestCheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  checkoutRecords: CheckoutRecord[] = [];
  backgroundImage: SafeStyle;
  searchTerm: string = '';
  filterStatus: 'all' | 'completed' | 'pending' = 'all';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private checkoutService: CheckoutService
  ) {
    this.checkoutForm = this.fb.group({
      guestName: ['', Validators.required],
      roomNumber: ['', Validators.required],
      miniBar: [false],
      houseKeeping: [false],
      billPaid: [false],
      keyReturned: [false]
    });
    this.backgroundImage = this.sanitizer.bypassSecurityTrustStyle(
      'url("/assets/1040097-download-free-studio-ghibli-wallpaper-1920x1080-for-computer.jpg")'
    );
  }

  ngOnInit(): void {
    // In a real app, you would fetch this from a service
    this.loadMockData();
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      const button = document.querySelector('button[type="submit"]');
      button?.classList.add('success');
      
      const formValue = this.checkoutForm.value;
      const newRecord: CheckoutRecord = {
        ...formValue,
        checkoutTime: new Date(),
        status: this.isCheckoutComplete(formValue) ? 'Completed' : 'Pending'
      };
      
      this.checkoutService.createCheckout(newRecord).subscribe(
        checkout => {
          this.checkoutRecords.unshift(checkout);
          this.checkoutForm.reset();
        }
      );
    }
  }

  private isCheckoutComplete(record: CheckoutForm): boolean {
    return record.miniBar && 
           record.houseKeeping && 
           record.billPaid && 
           record.keyReturned;
  }

  private loadMockData() {
    this.checkoutService.getCheckouts().subscribe(
      checkouts => this.checkoutRecords = checkouts
    );
  }

  completeCheckout(record: CheckoutRecord): void {
    const index = this.checkoutRecords.indexOf(record);
    if (index !== -1) {
      this.checkoutRecords[index] = {
        ...record,
        status: 'Completed',
        miniBar: true,
        houseKeeping: true,
        billPaid: true,
        keyReturned: true
      };
    }
  }

  get filteredRecords() {
    return this.checkoutRecords
      .filter(record => 
        record.guestName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        record.roomNumber.includes(this.searchTerm)
      )
      .filter(record => 
        this.filterStatus === 'all' ? true : 
        this.filterStatus === 'completed' ? record.status === 'Completed' : 
        record.status === 'Pending'
      );
  }

  get paginatedRecords() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRecords.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredRecords.length / this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }
} 