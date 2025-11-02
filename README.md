# TicketBoss - Event Ticketing API

A real-time event ticketing API with optimistic concurrency control for seat reservations. Built for high-concurrency scenarios to prevent over-booking while providing instant accept/deny responses.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Technical Decisions](#technical-decisions)
- [Project Structure](#project-structure)

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/R-Abinav/TicketBoss.git
cd TicketBoss
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=8080
DATABASE_URL="postgresql://username:password@localhost:5432/ticketboss"
EVENT_ID=node-meetup-2025
```

Replace `username` and `password` with your PostgreSQL credentials.

4. Set up the database
```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

5. Start the application```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:8080` (or the PORT specified in `.env`).

### Database Seeding

The application automatically seeds the database with initial event data on first startup:

- Event ID: `node-meetup-2025`
- Event Name: `Node.js Meet-up`
- Total Seats: 500
- Available Seats: 500
- Version: 0

---

## API Documentation

Base URL: `http://localhost:8080/api/v1`

### Endpoints

#### 1. Get Event Summary

Retrieve current event details including available seats and reservation count.

**Endpoint:** `GET /reservations`

**Response:** `200 OK`
```json
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Meet-up",
  "totalSeats": 500,
  "availableSeats": 458,
  "reservationCount": 42,
  "version": 14
}
```

**Example:**
```bash
curl "http://localhost:8080/api/v1/reservations"
```

---

#### 2. Reserve Seats

Create a new seat reservation for a partner.

**Endpoint:** `POST /reservations`

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "partnerId": "abc-corp",
  "seats": 3
}
```

**Parameters:**
- `partnerId` (string, required): Unique identifier for the partner
- `seats` (integer, required): Number of seats to reserve (1-10)

**Responses:**

**Success - 201 Created:**
```json
{
  "reservationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "seats": 3,
  "status": "confirmed"
}
```

**Insufficient Seats - 409 Conflict:**
```json
{
  "error": "Not enough seats left"
}```

**Validation Error - 400 Bad Request:**
```json
{
  "error": "number of seats must be between 1 and 10"
}
```

**Example:**
```bash
curl -X POST "http://localhost:8080/api/v1/reservations" \
  -H "Content-Type: application/json" \
  -d '{"partnerId": "abc-corp", "seats": 3}'
```
![Reserve Seats](./docs/reserveSeats.png)

---

#### 3. Cancel Reservation

Cancel an existing reservation and return seats to the available pool.

**Endpoint:** `DELETE /reservations/:reservationId`

**Parameters:**
- `reservationId` (string, required): UUID of the reservation to cancel

**Responses:**

**Success - 204 No Content:**

Empty response body. Seats are returned to the pool.

**Not Found - 404 Not Found:**
```json
{
  "error": "Reservation not found"
}
```

This error is returned if:
- The reservation ID does not exist
- The reservation has already been cancelled

**Example:**
```bash
curl -X DELETE "http://localhost:8080/api/v1/reservations/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```
![Cancel Seats](./docs/cancelSeats.png)

![Cancel Seats DB](./docs/cancelSeatsDB.png)

---

#### 4. Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "ok",
  "message":"TicketBoss API is running"
}
```

---

## Technical Decisions

### Architecture

**Layered Architecture Pattern:**

The application follows a clean separation of concerns with three main layers:

1. **Controller Layer**: Handles HTTP requests/responses, input validation, and error handling
2. **Service Layer**: Contains business logic and orchestrates transactions
3. **Repository Layer**: Managed by Prisma ORM for database operations

This separation ensures:
- Testability: Each layer can be unit tested independently
- Maintainability: Changes to one layer don't cascade to others
- Scalability: Easy to add new features or modify existing ones

### Database Choice: PostgreSQL

**Rationale:**

PostgreSQL was chosen over NoSQL databases for several critical reasons:

1. **ACID Compliance**: Full support for atomic transactions, crucial for preventing over-booking
2. **Optimistic Concurrency Control**: Native support for row versioning and conditional updates
3. **Data Consistency**: Strong consistency guarantees prevent race conditions in high-concurrency scenarios
4. **Relational Integrity**: Foreign key constraints ensure data integrity between events and reservations

### Optimistic Concurrency Control

**Implementation:**

The system uses a version-based optimistic locking strategy:
```typescript
// Pseudo-code
UPDATE events
SET available_seats = available_seats - 3,
    version = version + 1
WHERE event_id = 'node-meetup-2025'
  AND version = current_version
```

**How it works:**

1. Read the event and its current version number
2. Check if enough seats are available
3. Attempt to update with a WHERE clause checking the version
4. If the version changed (another transaction updated it), the update fails
5. Return a conflict error, allowing the client to retry

**Benefits:**

- No pessimistic locks that could cause deadlocks
- Better performance under high concurrency
- Automatic conflict detection
- Fair access for all clients

### Transaction Isolation

All critical operations use Prisma transactions with `Serializable` isolation level:

- Ensures atomic execution of multi-step operations
- Prevents phantom reads and non-repeatable reads
- Guarantees that seat count never goes negative
- Maintains consistency between events and reservations tables

### Technology Stack

**Backend Framework:**
- Express.js: Lightweight, flexible, and widely adopted
- TypeScript: Type safety reduces runtime errors

**ORM:**
- Prisma: Type-safe database client with excellent TypeScript support
- Automatic migration management
- Built-in connection pooling

**Validation:**
- Custom middleware for request validation
- Input sanitization to prevent injection attacks

### Assumptions

1. **Single Event**: The system currently manages one event at a time (extensible to multiple events)
2. **No Authentication**: Partner IDs are trusted (authentication can be added as middleware)
3. **Idempotency**: Clients should implement retry logic for 409 conflicts

### Error Handling

All errors are centralized through an Express error handler middleware:

- Custom error classes for different scenarios
- Consistent error response format
- Proper HTTP status codes
- Error logging for debugging

---

## Project Structure
```
TicketBoss/
├── prisma/
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Database schema definition
├── src/
│   ├── config/
│   │   ├── db.config.ts     # Database connection and seeding
│   │   └── env.config.ts    # Environment variable configuration
│   ├── controllers/
│   │   └── reservation.controller.ts  # HTTP request handlers
│   ├── middleware/
│   │   ├── errorHandler.middleware.ts  # Global error handling
│   │   └── validator.middleware.ts     # Request validation
│   ├── routes/
│   │   └── reservation.route.ts  # Route definitions
│   ├── services/
│   │   └── ticket.service.ts # Business logic and transactions
│   ├── type/
│   │   └── index.ts         # TypeScript interfaces and types
│   ├── utils/
│   │   └── errors.util.ts   # Custom error classes
│   ├── app.ts               # Express app configuration
│   └── server.ts            # Server entry point
├── .env                     # Environment variables (not in git)
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json        # The lock file
├── tsconfig.json            # TypeScript configuration
└── README.md                # Documentation
```

### Key Files

**`prisma/schema.prisma`**: Defines database schema with two models (Event and Reservation)

**`src/services/ticket.service.ts`**: Core business logic including:
- Seat reservation with optimistic locking
- Reservation cancellation with seat return
- Event summary aggregation

**`src/middleware/validator.middleware.ts`**: Input validation for:
- Seat count (1-10)
- Required fields
- Data types

**`src/config/db.config.ts`**:
- Prisma client singleton pattern
- Database connection management
- Automatic seeding on startup