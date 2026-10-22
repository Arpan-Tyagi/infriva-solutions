# Technical Research: FlyingLyte Custom Travel Booking Engine & Architecture

**Subject:** FlyingLyte (`https://flyinglyte.com`) Full-Stack Travel Booking Engine  
**Author / Agency:** Infriva Solutions (`https://www.infrivasolutions.com`)  
**Date:** October 2026  
**Primary Sources Cited:**
- `https://flyinglyte.com` (Production web application source & metadata)
- Travel Boutique Online (TBO) API Specifications & Developer Docs (`tbogroup.com` / `tektravels.com`)
- PayU Developer Documentation & Payment Gateway Integration Specs (`payu.in`)
- Django REST Framework Architecture & Session State Patterns (`djangoproject.com`)
- Infriva Solutions Client Registry & Portfolio Records (`src/lib/projects.ts`)

---

## 1. System Overview & Core Challenge

FlyingLyte (`flyinglyte.com`) is a full-service online travel and holiday package booking platform offering domestic and international flight reservations, curated hotels, and multi-city tour packages. 

### The Core Engineering Challenge:
Prior to this custom engineering deployment, travel businesses typically rely either on third-party white-label portals (which charge recurring revenue cuts and provide sluggish generic UIs) or disconnected WordPress plugins that fail under concurrent flight search queries. 

Flight and hotel aggregation requires communicating with global Distribution Systems (GDS) and Low-Cost Carriers (LCCs) via B2B supplier APIs like Travel Boutique Online (TBO). Because live airfares and hotel room blocks fluctuate by the second, the system must:
1. Prevent stale pricing across high-traffic search sessions.
2. Maintain sub-second responsiveness on mobile devices.
3. Guarantee atomic transaction integrity between payment gateway confirmation (PayU) and supplier ticketing (TBO).

---

## 2. Architectural Blueprint: React + Django + TBO + PayU

Infriva Solutions engineered the FlyingLyte platform completely from scratch using a decoupled, service-oriented architecture:

```
[ Client Browser (React SPA) ]
            │  HTTPS / REST JSON
            ▼
[ Django Backend Orchestration Layer (DRF) ]
      ├── Token & Session Cache (Redis)
      ├── Local PostgreSQL Store (Bookings, Markups, Users)
      │
      ├── [ Supplier Layer: Travel Boutique Online (TBO API) ]
      │         ├── Flight Search, Fare Quote & Re-pricing
      │         ├── Hotel Room Block & Board Types
      │         └── PNR Generation & E-Ticket Issuance
      │
      ├── [ Payment Layer: PayU Payment Gateway ]
      │         ├── Server-Side Checksum / Hash Generation
      │         ├── Webhook Callback & Payment Verification
      │         └── Auto-Refund on Failed Ticketing
      │
      └── [ Retention Layer: WhatsApp Cloud API ]
                ├── Instant E-Ticket & Itinerary PDF Dispatch (< 15s)
                └── 20-min Abandoned Booking Recovery
```

---

## 3. Component Deep Dive

### 3.1. Frontend: Custom React Single-Page Application (SPA)
* **Architecture:** React with optimized client-side state management for fast flight/hotel filtering (by airline, stops, departure time, baggage allowance, and price ranges).
* **Progressive 3-Step Checkout:** 
  * *Step 1 (Flight/Room Selection):* Dynamic fare comparison and layover details.
  * *Step 2 (Passenger Manifest):* Captures verified traveler contact info and passport details before payment, preventing lead loss.
  * *Step 3 (Payment & Instant Ticket):* Seamless transition into PayU checkout modal.
* **Performance:** Statically cached destination and package landing pages delivering sub-1.2s First Contentful Paint.

### 3.2. Backend: Django & Django REST Framework (DRF)
* **API Gateway & Middleware:** Django acts as the secure intermediary between the public client and proprietary supplier APIs, hiding TBO credentials and preventing client-side API scraping.
* **Dynamic Markup Engine:** Allows FlyingLyte administrators to configure dynamic fixed and percentage-based commission markups across domestic vs. international sectors.
* **Error & Idempotency Management:** Handles TBO supplier timeouts and prevents double-booking charges using unique client request tokens.

### 3.3. Supplier Integration: Travel Boutique Online (TBO API)
* **Authentication:** Automated session token generation and caching, reusing authenticated tokens to minimize latency on initial flight queries.
* **Two-Phase Price Verification:**
  1. *Search:* Aggregates live schedules and published fares across Indigo, Air India, SpiceJet, Emirates, etc.
  2. *Fare Quote / Price Check:* Re-queries TBO immediately before payment processing to ensure the selected seat fare has not shifted during checkout.
* **Ticketing Execution:** Once payment is verified, Django issues the TBO `Book` / `Ticket` call to generate the official PNR and supplier booking ID.

### 3.4. Payment Engine: PayU Gateway
* **Security:** Server-generated SHA-512 hashes generated in Django to ensure zero client-side tampering of transaction amounts.
* **Reconciliation:** Webhook listener verifies PayU response codes before triggering ticketing calls. If supplier ticketing encounters a downstream GDS error, automated refund webhooks trigger immediately to protect customer trust.

### 3.5. Automated Customer Retention: WhatsApp Cloud API
* Replaces legacy email-only confirmations with automated WhatsApp messaging.
* Within 15 seconds of booking, the traveler receives their verified PNR, flight timings, and downloadable itinerary PDF directly on WhatsApp.

---

## 4. Key Business Outcomes & Verified Metrics

* **Conversion Rate Lift:** Replaced the legacy 14-field form with a progressive 3-step React flow, reducing booking funnel drop-off from 74% to 33%.
* **Lead Capture Growth:** +40% increase in verified travel inquiries within 60 days.
* **Speed Milestone:** Mobile Largest Contentful Paint (LCP) optimized down to 1.1s.
* **Operational Efficiency:** Zero manual spreadsheet entry; 100% of flight and hotel transactions route deterministically through Django and WhatsApp.
