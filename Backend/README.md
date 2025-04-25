# Construction Management System Backend

A Node.js/Express.js backend for a construction management system that supports two shops (Shop 1 and Shop 2) using MongoDB.

## Features

- Customer management with profiles and soft deletion
- Advance payment tracking
- Sales and billing system
- Stock inventory management
- Expense tracking

## Tech Stack

- Node.js and Express.js for API server
- MongoDB for database
- Mongoose for object modeling
- Joi for validation
- Winston and Morgan for logging
- CORS for cross-origin requests

## API Endpoints

All endpoints are prefixed with `/api/:shop` where `:shop` is either `shop1` or `shop2`.

### Customer Management

- `GET /api/:shop/customers` - Get all customers
- `GET /api/:shop/customers/:phoneNumber` - Get customer by phone number
- `POST /api/:shop/customers` - Create new customer
- `PUT /api/:shop/customers/:phoneNumber/profiles/:profileId` - Update profile
- `DELETE /api/:shop/customers/:phoneNumber/profiles/:profileId` - Soft delete profile
- `POST /api/:shop/customers/:phoneNumber/profiles/:profileId/restore` - Restore soft-deleted profile
- `DELETE /api/:shop/customers/:phoneNumber/profiles/:profileId/permanent` - Permanently delete profile

### Advance Payments

- `POST /api/:shop/customers/:phoneNumber/profiles/:profileId/advance` - Add advance payment
- `GET /api/:shop/customers/:phoneNumber/profiles/:profileId/advance` - Get advance details

### Sales and Bills

- `POST /api/:shop/sales` - Create new sale
- `GET /api/:shop/sales` - Get all sales
- `DELETE /api/:shop/sales/:billNo` - Delete a sale

### Stock Management

- `GET /api/:shop/stock` - Get stock items
- `POST /api/:shop/stock` - Add new stock item
- `PUT /api/:shop/stock/:id` - Update stock item
- `DELETE /api/:shop/stock` - Delete stock items by name, category, and unit

### Expense Management

- `GET /api/:shop/expenses` - Get expenses
- `POST /api/:shop/expenses` - Add new expense
- `PUT /api/:shop/expenses/:id` - Update expense
- `DELETE /api/:shop/expenses/:id` - Delete expense

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/construction-management
   NODE_ENV=development
   ```
4. Start the server:
   ```
   npm start
   ```
   Or for development:
   ```
   npm run dev
   ```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables:
   - `PORT`: 10000 (Render default)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: production
4. Set the build command: `npm install`
5. Set the start command: `npm start`

## API Response Examples

### Get Customer

```json
{
  "phoneNumber": "9876543210",
  "profiles": [
    {
      "profileId": "profile-1698765432100",
      "name": "John Doe [Site A]",
      "advance": {
        "value": true,
        "currentamount": 5000,
        "showinadvance": true,
        "paymentMethod": "Cash"
      },
      "advanceHistory": [
        {
          "transactionType": "Deposit",
          "amount": 5000,
          "date": "2023-04-25T00:00:00.000Z"
        }
      ],
      "bills": [
        {
          "billNo": "B001",
          "date": "25-04-2023",
          "items": [
            {
              "product": "Cement",
              "qty": 10,
              "unit": "Bag",
              "pricePerQty": 350,
              "amount": 3500
            }
          ],
          "totalAmount": 3500,
          "advanceRemaining": 1500,
          "creditAmount": null,
          "paymentMethod": "Advance"
        }
      ],
      "credit": 0,
      "paymentMethod": "Cash",
      "deleteuser": {
        "value": false,
        "date": ""
      }
    }
  ],
  "createdAt": "2023-04-25T00:00:00.000Z",
  "updatedAt": "2023-04-25T00:00:00.000Z"
}
```

## Error Handling

All errors are returned with appropriate HTTP status codes and a message:

```json
{
  "message": "Customer not found"
}
```

## Data Validation

Input validation is performed using Joi. Examples of validation rules:

- Phone numbers must be valid
- Amounts must be positive
- Required fields must be present
- Dates must be valid

## License

This project is licensed under the MIT License.