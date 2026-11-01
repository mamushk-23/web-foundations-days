# TicketHub System Design

## 1. Requirements

**Functional Requirements:**
- Users can browse events and view available seats.
- Users can hold a seat for a short period (e.g., 10 minutes) while completing payment.
- Users can pay for held seats and receive a confirmed ticket.
- Users can view their purchased tickets.

**Non-Functional Requirements:**
- **Speed:** Event browsing must load in <200ms. Seat holding and checkout must complete in <2 seconds.
- **Correctness:** Zero double-bookings. A seat can only be sold to one person.
- **Fairness:** During a "big sale," requests should be processed fairly (e.g., first-come, first-served via a queue) to prevent bot abuse and system crashes.
- **Availability:** 99.9% uptime, especially during high-traffic ticket drops.

## 2. Traffic Estimates

**Normal Day:**
- Visitors: 50,000/day. Pages viewed: 50,000 × 10 = 500,000 pages/day.
- Reads/sec (avg): 500,000 / 86,400 ≈ **~6 reads/sec**. Peak (5×) ≈ **30 reads/sec**.
- Tickets sold: 5,000/day. Writes/sec (avg): 5,000 / 86,400 ≈ **~0.06 writes/sec**.

**Big Sale Peak (200,000 people, 20,000 seats, 10 minutes):**
- Time window: 600 seconds.
- Request rate: 200,000 users trying to buy/hold seats = **~333 write/hold requests/sec**.
- This is a **5,500× spike** in write traffic compared to normal daily averages. The system must be designed specifically to absorb this burst without double-booking or crashing.

## 3. API Design

| Method | Endpoint | Description | Success Status |
|--------|----------|-------------|----------------|
| GET | `/events` | Browse upcoming events with pagination | 200 OK |
| GET | `/events/{id}/seats` | View available seats for a specific event | 200 OK |
| POST | `/seats/{id}/hold` | Reserve a seat temporarily (returns a hold token) | 201 Created |
| POST | `/orders` | Checkout and pay for held seats (requires hold token) | 201 Created |
| GET | `/users/{id}/tickets` | View purchased tickets for a user | 200 OK |

## 4. Data Model

**Entities & Relationships:**
- **users** (1) to (N) **orders**: A user can place many orders.
- **events** (1) to (N) **seats**: An event has many seats.
- **seats** (1) to (0..1) **orders**: A seat can be in at most one confirmed order (or temporarily held).

**CREATE TABLE Statements:**

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    event_date TIMESTAMP NOT NULL
);

CREATE TABLE seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    section VARCHAR(50) NOT NULL,
    row VARCHAR(10) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    status ENUM('available', 'held', 'sold') DEFAULT 'available',
    held_until TIMESTAMP NULL,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    seat_id INT NOT NULL UNIQUE,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (seat_id) REFERENCES seats(id)
);
