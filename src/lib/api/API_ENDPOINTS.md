# Train Station Dashboard - API Endpoints Documentation

## Overview

The Train Station Dashboard API provides comprehensive RESTful endpoints for managing venue operations including customers, inventory, finances, staff, events, and artists. All endpoints follow consistent patterns with standardized error handling and validation.

**Base URL**: `https://your-project.supabase.co/functions/v1/api`

## Authentication

All endpoints except `/health` require authentication via Supabase Auth.

Include the following header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "requestId": "req_12345",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "source": "api"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "type": "https://docs.trainstation-dashboard.com/errors/validation-error",
    "title": "Validation Error", 
    "status": 400,
    "detail": "Request data validation failed",
    "instance": "/api/customers",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "errors": [
      {
        "field": "email",
        "code": "invalid_email",
        "message": "Invalid email format",
        "value": "invalid-email"
      }
    ]
  }
}
```

## Health Check

### GET /api/health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": ["customers", "inventory", "finances", "staff", "events", "artists"]
}
```

## Customer Management

### GET /api/customers
Get all customers with optional filtering and pagination.

**Query Parameters:**
- `limit` (number): Items per page (default: 20)
- `offset` (number): Pagination offset (default: 0)
- `status` (string): Filter by status (active, inactive, suspended)
- `tier` (string): Filter by customer tier (bronze, silver, gold, platinum)
- `tags` (string[]): Filter by tags
- `dateFrom` (string): Filter by creation date from (ISO 8601)
- `dateTo` (string): Filter by creation date to (ISO 8601)
- `search` (string): Search in name and email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "status": "active",
      "tier": "gold",
      "marketingOptIn": true,
      "tags": ["vip", "regular"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/customers
Create a new customer.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "postalCode": "12345",
    "country": "Country"
  },
  "tier": "bronze",
  "marketingOptIn": false,
  "notes": "Customer notes",
  "tags": ["new"],
  "source": "website"
}
```

### GET /api/customers/:id
Get a specific customer by ID.

### PUT /api/customers/:id
Update a customer.

### DELETE /api/customers/:id
Delete a customer (soft delete by default).

**Query Parameters:**
- `hard` (boolean): Perform hard delete (admin only)

### GET /api/customers/:id/interactions
Get customer interactions.

### POST /api/customers/:id/interactions
Create a customer interaction.

**Request Body:**
```json
{
  "type": "call",
  "subject": "Follow-up call",
  "description": "Discussed upcoming event",
  "staffId": "staff-uuid",
  "outcome": "positive",
  "followUpRequired": true,
  "followUpDate": "2024-02-01T00:00:00.000Z"
}
```

## Inventory Management

### GET /api/inventory
Get all inventory items.

**Query Parameters:**
- `limit`, `offset` (pagination)
- `category` (string): Filter by category
- `status` (string): Filter by status (active, discontinued, out_of_stock)
- `lowStock` (boolean): Show only low stock items
- `search` (string): Search in name and SKU

### POST /api/inventory
Create a new inventory item.

**Request Body:**
```json
{
  "name": "Concert T-Shirt",
  "sku": "TSHIRT-001",
  "description": "Official venue t-shirt",
  "category": "merchandise",
  "unitOfMeasure": "each",
  "currentStock": 100,
  "minStock": 10,
  "maxStock": 500,
  "reorderPoint": 20,
  "reorderQuantity": 100,
  "unitCost": 15.00,
  "sellingPrice": 25.00,
  "supplier": "Local Printing Co"
}
```

### GET /api/inventory/:id
Get specific inventory item.

### PUT /api/inventory/:id
Update inventory item.

### DELETE /api/inventory/:id
Delete inventory item.

### POST /api/inventory/transactions
Record inventory transaction.

**Request Body:**
```json
{
  "itemId": "item-uuid",
  "type": "in",
  "quantity": 50,
  "reason": "restock",
  "unitCost": 15.00,
  "notes": "Weekly restock delivery"
}
```

### GET /api/inventory/categories
Get all inventory categories.

### POST /api/inventory/categories
Create new inventory category.

## Financial Management

### GET /api/finances/transactions
Get financial transactions.

**Query Parameters:**
- `limit`, `offset` (pagination)
- `type` (string): Filter by type (income, expense, transfer, adjustment, refund)
- `category` (string): Filter by category
- `dateFrom`, `dateTo` (string): Date range filter
- `minAmount`, `maxAmount` (number): Amount range filter

### POST /api/finances/transactions
Create financial transaction.

**Request Body:**
```json
{
  "type": "income",
  "amount": 1500.00,
  "currency": "USD",
  "category": "ticket_sales",
  "description": "Concert ticket sales",
  "accountId": "account-uuid",
  "eventId": "event-uuid",
  "taxRate": 0.08,
  "receipt": {
    "number": "REC-001",
    "url": "https://example.com/receipt.pdf"
  }
}
```

### GET /api/finances/accounts
Get chart of accounts.

### POST /api/finances/accounts
Create new account.

### GET /api/finances/budgets
Get budgets.

### POST /api/finances/budgets
Create new budget.

### GET /api/finances/reports/:reportType
Generate financial reports.

**Report Types:**
- `profit-loss`: Profit & Loss statement
- `balance-sheet`: Balance sheet
- `cash-flow`: Cash flow statement

**Query Parameters:**
- `dateFrom`, `dateTo` (required): Report date range

## Staff Management

### GET /api/staff
Get staff members.

**Query Parameters:**
- `department` (string): Filter by department
- `role` (string): Filter by role
- `status` (string): Filter by status (active, inactive, on_leave)

### POST /api/staff
Create staff member.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@venue.com",
  "phone": "+1234567890",
  "department": "operations",
  "position": "Event Coordinator",
  "role": "STAFF",
  "hireDate": "2024-01-15",
  "salary": 45000,
  "skills": ["event_planning", "customer_service"],
  "emergencyContact": {
    "name": "John Smith",
    "relationship": "spouse",
    "phone": "+1234567891"
  }
}
```

### GET /api/staff/:id
Get specific staff member.

### PUT /api/staff/:id
Update staff member.

### DELETE /api/staff/:id
Delete staff member.

### GET /api/staff/:id/schedule
Get staff schedule.

**Query Parameters:**
- `dateFrom`, `dateTo` (string): Date range

### POST /api/staff/:id/schedule
Create schedule entry.

## Event Management

### GET /api/events
Get events.

**Query Parameters:**
- `status` (string): Filter by status
- `venue` (string): Filter by venue
- `dateFrom`, `dateTo` (string): Date range filter
- `type` (string): Filter by event type

### POST /api/events
Create event.

### GET /api/events/:id
Get specific event.

### PUT /api/events/:id
Update event.

### DELETE /api/events/:id
Delete event.

## Artist Management

### GET /api/artists
Get artists.

**Query Parameters:**
- `genre` (string): Filter by genre
- `status` (string): Filter by status
- `search` (string): Search in name

### POST /api/artists
Create artist.

### GET /api/artists/:id
Get specific artist.

### PUT /api/artists/:id
Update artist.

### DELETE /api/artists/:id
Delete artist.

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request data validation failed |
| `BUSINESS_RULE_VIOLATION` | 400 | Business rule constraint violated |
| `AUTHENTICATION_REQUIRED` | 401 | Authentication required |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `METHOD_NOT_ALLOWED` | 405 | HTTP method not allowed for endpoint |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## Rate Limiting

- **Default Limit**: 100 requests per minute per user
- **Endpoints with higher limits**: Health check (unlimited)
- **Headers**: Rate limit info included in response headers

## Examples

### Create Customer with Full Validation
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/api/customers' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "tier": "bronze",
    "marketingOptIn": true
  }'
```

### Get Customers with Filtering
```bash
curl 'https://your-project.supabase.co/functions/v1/api/customers?tier=gold&limit=10&search=john' \
  -H 'Authorization: Bearer your-jwt-token'
```

### Create Inventory Transaction
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/api/inventory/transactions' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "itemId": "item-uuid",
    "type": "out",
    "quantity": 5,
    "reason": "sale",
    "notes": "Sold at event"
  }'
```

## Testing

Use the health check endpoint to verify API connectivity:
```bash
curl 'https://your-project.supabase.co/functions/v1/api/health'
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": ["customers", "inventory", "finances", "staff", "events", "artists"]
}
``` 