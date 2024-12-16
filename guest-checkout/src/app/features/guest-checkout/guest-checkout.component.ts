import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckoutForm, CheckoutRecord, PriorityLevel } from './models/checkout.interface';
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
  loading = false;
  error: string | null = null;
  priorityLevels: PriorityLevel[] = ['VIP', 'Superior', 'Classic'];
  Math = Math;

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
      keyReturned: [false],
      isLateCheckout: [false],
      checkoutTime: [''],
      priority: ['Classic', Validators.required]
    });
    this.backgroundImage = this.sanitizer.bypassSecurityTrustStyle(
      'url("/assets/1040097-download-free-studio-ghibli-wallpaper-1920x1080-for-computer.jpg")'
    );
  }

  ngOnInit(): void {
    this.loadCheckoutRecords();
  }

  loadCheckoutRecords(): void {
    this.loading = true;
    this.error = null;
    
    this.checkoutService.getCheckouts().subscribe({
      next: (records) => {
        this.checkoutRecords = records;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load checkout records. Please try again.';
        this.loading = false;
        console.error('Error loading checkout records:', error);
      }
    });
  }

  calculateLateFee(checkoutTime: Date): number {
    const standardCheckoutTime = new Date(checkoutTime);
    standardCheckoutTime.setHours(11, 0, 0); // Standard checkout time is 11:00 AM

    if (checkoutTime > standardCheckoutTime) {
      const hoursDiff = Math.ceil(
        (checkoutTime.getTime() - standardCheckoutTime.getTime()) / (1000 * 60 * 60)
      );
      return hoursDiff * 50; // $50 per hour after 11:00 AM
    }
    return 0;
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      const formValue = this.checkoutForm.value;
      const checkoutTime = formValue.checkoutTime ? 
        new Date(formValue.checkoutTime) : 
        new Date();

      const lateFee = formValue.isLateCheckout ? 
        this.calculateLateFee(checkoutTime) : 
        0;

      const newCheckout = {
        ...formValue,
        checkoutTime,
        status: 'Pending' as const,
        lateFee,
        priority: formValue.priority || 'Classic'
      };

      console.log('Submitting checkout:', newCheckout);

      this.checkoutService.createCheckout(newCheckout).subscribe({
        next: (created) => {
          console.log('Created checkout:', created);
          this.checkoutRecords.unshift(created);
          this.checkoutForm.reset({
            priority: 'Classic'
          });
        },
        error: (error) => {
          console.error('Error creating checkout:', error);
        }
      });
    }
  }

  private isCheckoutComplete(record: CheckoutForm): boolean {
    return record.miniBar && 
           record.houseKeeping && 
           record.billPaid && 
           record.keyReturned;
  }

  completeCheckout(record: CheckoutRecord): void {
    const updatedRecord = {
      ...record,
      status: 'Completed' as const
    };

    this.checkoutService.updateCheckout(record._id, updatedRecord).subscribe({
      next: (updated) => {
        // Update the local array with the new record
        const index = this.checkoutRecords.findIndex(r => r._id === updated._id);
        if (index !== -1) {
          this.checkoutRecords[index] = updated;
        }
      },
      error: (error) => {
        console.error('Error updating checkout status:', error);
        // Handle error appropriately (show user feedback)
      }
    });
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
      )
      .sort((a, b) => {
        const priorityOrder = { VIP: 0, Superior: 1, Classic: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
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

  getPriorityColor(priority: PriorityLevel): string {
    switch (priority) {
      case 'VIP':
        return 'priority-vip';
      case 'Superior':
        return 'priority-superior';
      case 'Classic':
        return 'priority-classic';
      default:
        return '';
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const maxPages = 5; // Show max 5 page numbers
    
    let start = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    return range;
  }

  getMaxItems(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredRecords.length);
  }
} 