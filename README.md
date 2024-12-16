# Guest Checkout Management

## Introduction
Welcome to the Guest Checkout Management project! This document provides an overview of the project, including its purpose, technology stack, and how to get started.

## What the Application is About
Guest Checkout Management is designed to simplify the process of managing guest checkouts in hotels. The application offers a user-friendly interface for handling guest information, managing checkout processes, and tracking checkout status.

## Technology Stack
The project is built using the following technologies:
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine
- **Express.js**: A minimal and flexible Node.js web application framework
- **MongoDB Atlas**: A fully-managed cloud database service
- **Angular**: A TypeScript-based web application framework
- **TypeScript**: A typed superset of JavaScript

## Project Structure
The project consists of two main parts:

### Frontend (guest-checkout)
- Built with Angular 19
- Located in the `guest-checkout/` directory
- Features:
  - Guest checkout form with validation
  - Priority-based checkout management (VIP, Superior, Classic)
  - Late checkout handling with automatic fee calculation
  - Real-time status tracking
  - Pagination and search functionality

### Backend (guest-checkout-server)
- Built with Express.js
- Located in the `guest-checkout-server/` directory
- Components:
  - `server.js`: Application entry point
  - `routes/`: API endpoint definitions
  - `models/`: MongoDB schema definitions
  - `config/`: Database configuration

## System Architecture & Communication

### Port Configuration
- Frontend (Angular): Runs on `http://localhost:4200`
- Backend (Express): Runs on `http://localhost:3000`

### Communication Flow
1. **Frontend to Backend Communication**
   - The Angular frontend communicates with the Express backend through HTTP requests
   - The CheckoutService (`src/app/services/checkout.service.ts`) handles all API calls:
   ```typescript
   private apiUrl = 'http://localhost:3000/api/checkouts';
   
   // Example of GET request
   getCheckouts(): Observable<CheckoutRecord[]> {
     return this.http.get<CheckoutRecord[]>(this.apiUrl);
   }
   ```

2. **API Endpoints & Data Flow**
   - **GET /api/checkouts**
     - Frontend: Requests list of checkouts
     - Backend: Queries MongoDB and returns sorted results
     - Response: Array of checkout records
   
   - **POST /api/checkouts**
     - Frontend: Sends new checkout data
     - Backend: Validates and saves to MongoDB
     - Response: Created checkout record
   
   - **PATCH /api/checkouts/:id**
     - Frontend: Sends updated checkout data
     - Backend: Updates record and recalculates fees if needed
     - Response: Updated checkout record

### CORS Configuration
The backend is configured to accept requests from the frontend origin:
```javascript
// server.js
app.use(cors());
```

### Installation & Setup

#### Backend Setup
1. Navigate to the server directory:
    ```bash
    cd guest-checkout-server
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env` file:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    ```
4. Start the server:
    ```bash
    npm run dev
    ```

#### Frontend Setup
1. Navigate to the Angular application directory:
    ```bash
    cd guest-checkout
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    ng serve
    ```

### Development Workflow
1. Start both servers:
   - Backend: `npm run dev` (port 3000)
   - Frontend: `ng serve` (port 4200)
2. The Angular application will automatically proxy requests to the backend
3. Any changes to the frontend code will trigger automatic reload
4. Backend changes require server restart unless using nodemon

## Usage
To start the project, use the following command:
```bash
npm start
```
This will run the application on `http://localhost:3000`.

## Features
- User-friendly interface for managing guest checkouts
- Secure handling of guest information
- Comprehensive reporting tools

## API Endpoints
The backend API provides several endpoints for managing guest checkouts. Here are some of the key endpoints:

- `GET /api/guests`: Retrieve a list of all guests.
- `POST /api/guests`: Add a new guest.
- `GET /api/guests/:id`: Retrieve details of a specific guest.
- `PUT /api/guests/:id`: Update details of a specific guest.
- `DELETE /api/guests/:id`: Delete a specific guest.

## Future Enhancements
We have several planned enhancements for the project, including:
- Adding user authentication and authorization.
- Implementing advanced reporting features.
- Enhancing the user interface with additional customization options.
- Integrating with third-party services for additional functionality.

## Contributing
We welcome contributions! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature/your-feature-name
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Add your commit message"
    ```
4. Push to the branch:
    ```bash
    git push origin feature/your-feature-name
    ```
5. Create a pull request.

## Conclusion
Guest Checkout Management aims to provide a seamless and efficient way to manage guest checkouts. We hope this documentation helps you get started with the project. If you have any questions or need further assistance, feel free to reach out.

## Key Code Examples

### Frontend Component (guest-checkout.component.ts)
```typescript
@Component({
  selector: 'app-guest-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule],
  templateUrl: './guest-checkout.component.html',
  styleUrls: ['./guest-checkout.component.css']
})
export class GuestCheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  priorityLevels: PriorityLevel[] = ['VIP', 'Superior', 'Classic'];

  constructor(private fb: FormBuilder, private checkoutService: CheckoutService) {
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
  }

  // Filter and sort records by priority
  get filteredRecords() {
    return this.checkoutRecords
      .filter(record => 
        record.guestName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        record.roomNumber.includes(this.searchTerm)
      )
      .sort((a, b) => {
        const priorityOrder = { VIP: 0, Superior: 1, Classic: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }
}
```

### Backend API Routes (checkouts.js)
```javascript
const express = require('express');
const router = express.Router();
const Checkout = require('../models/checkout');

// Get all checkouts
router.get('/', async (req, res) => {
  try {
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
    lateFee: req.body.isLateCheckout ? calculateLateFee(req.body.checkoutTime) : 0
  });

  try {
    const newCheckout = await checkout.save();
    res.status(201).json(newCheckout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
```

### MongoDB Schema (checkout.js)
```javascript
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

// Indexes for optimized queries
checkoutSchema.index({ priority: 1, checkoutTime: -1 });
checkoutSchema.index({ guestName: 1 });
checkoutSchema.index({ status: 1 });
```

### Frontend Service (checkout.service.ts)
```typescript
@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = 'http://localhost:3000/api/checkouts';

  constructor(private http: HttpClient) {}

  getCheckouts(): Observable<CheckoutRecord[]> {
    return this.http.get<CheckoutRecord[]>(this.apiUrl);
  }

  createCheckout(checkout: CheckoutRecord): Observable<CheckoutRecord> {
    return this.http.post<CheckoutRecord>(this.apiUrl, checkout);
  }

  updateCheckout(id: string, checkout: Partial<CheckoutRecord>): Observable<CheckoutRecord> {
    return this.http.patch<CheckoutRecord>(`${this.apiUrl}/${id}`, checkout);
  }
}
```

These code examples demonstrate:
- Angular component with form handling and priority sorting
- Express routes for handling checkout operations
- MongoDB schema with proper indexing
- Angular service for API communication

The complete implementation includes additional features like pagination, search functionality, and status management. For the full codebase, please refer to the respective files in the project structure.


