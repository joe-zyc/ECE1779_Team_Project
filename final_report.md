
## 1. User Guide

### 1.1 Overview

OpenMotor is a cloud-native used-car marketplace designed for individual buyers and sellers. The platform provides two distinct role-based interfaces: a Seller Hub for managing vehicle listings and a Buyer Browse experience that includes preference-based email alerts. All features are accessible through a standard web browser after registration.

### 1.2 Getting Started

#### Registration

1. Navigate to the homepage and click **Sign Up**.
2. Enter your display name, email address, and password.
3. Select your role: **Buyer** or **Seller**. Role selection is permanent and determines which features are available to you.
4. Click **Create Account**. You will be redirected to the appropriate dashboard.

#### Login / Logout

1. Click **Log In** from the navigation bar and enter your registered credentials.
2. The system issues a short-lived access token (15 minutes) and a refresh token (7 days). Sessions are maintained automatically.
3. To log out, click **Log Out** in the navigation bar.

---

### 1.3 Seller Workflow

All seller actions are accessible from the Seller Hub.

#### Creating a Listing

1. From the Seller Hub, you can see **Create Listing**.
2. Fill in the required vehicle details:
   - Make, Model, Trim, Year, VIN
   - Body Type, Color
   - Mileage (km), Price (CAD)
   - Contact Email, Contact Phone
   - Description (optional)
3. Click **Create Draft** to create the listing as a **Draft**. Drafts are not visible to buyers until published.

#### Uploading Images

1. Open a draft listing from the Hub and click **Upload Images**.
2. Select one or more image files (JPEG, PNG, or WebP; maximum 5 MB per file; up to 10 images per listing).
3. To remove an uploaded image, click the **Delete** button beneath it.

#### Publishing a Listing

1. From the Seller Hub, click **Publish** on a draft listing.
2. The system validates all required fields. Validation failures display inline error messages.
3. Once published, the listing becomes publicly visible in the Browse page.
4. Publishing triggers the email notification system: any buyer whose saved preferences match the new listing will receive an email alert automatically.

#### Editing and Managing Listings

- Click **Edit** on any listing to update vehicle details, price, or contact information.
- Click **Unpublish** to revert a published listing to draft status. It will no longer appear in public searches.
- Click **Delete** to permanently remove a listing (soft-deleted; status set to `removed`).

---

### 1.4 Buyer Workflow

#### Browsing Listings

1. Click **Browse** in the navigation bar to open the public listings page (`/browse`).
2. Published listings are displayed as cards showing make, model, year, price, mileage, and thumbnail.
3. Use the search bar to filter by make, model, trim, or color via free-text match.
4. Use price filters (min/max CAD) to narrow results by budget.
5. Use the **Sort** dropdown to order results by:
   - Newest (default)
   - Price: Low to High
   - Price: High to Low
   - Year: Newest First
   - Mileage: Lowest First
6. Results are paginated (5 per page). Use the **Previous** / **Next** buttons to navigate.

#### Viewing a Listing

- Click any listing card to open the **Listing Detail** page.
- The detail view shows full vehicle specifications, contact information, seller description, and all uploaded photos.
- The image gallery renders photos with lazy loading. Photos that cannot be loaded are hidden automatically.


#### Managing Preferences (Email Alerts)

1. Log in as a buyer and navigate to **My Preferences** (`/preferences`).
2. Click **Create Preference** and fill in any combination of:

   | Field | Description |
   |-------|-------------|
   | Make | Vehicle manufacturer (e.g., Toyota) |
   | Model | Model name (e.g., Camry) |
   | Year Min / Max | Acceptable year range |
   | Max Price (CAD) | Maximum price in Canadian dollars |
   | Max Mileage (km) | Maximum odometer reading |
   | Color | Preferred color |

3. Check **Active** to enable the alert, or uncheck it to pause without deleting.
4. Click **Save Preference**. When any seller publishes a matching listing, you will receive an email notification at your registered address.
5. To modify an existing preference, click **Edit**, adjust values, and click **Save Changes**.
6. To remove an alert entirely, click **Delete**.

---

## 2. Deployment Information

### 2.1 Architecture Overview

The application follows a three-tier, cloud-native architecture. Incoming traffic is handled by a DigitalOcean Load Balancer, which routes requests to the appropriate Kubernetes service. The Frontend Service (React/Vite) serves the single-page application, while the Backend Service (Node.js/Express) handles all API requests. The backend connects to a PostgreSQL 16 database pod backed by a DigitalOcean Volume for persistent storage, and reads/writes user-uploaded images from a second Volume-mounted directory. Outbound email is delivered via an external SMTP relay (Nodemailer).

```
Internet
   │
   ▼
[ DigitalOcean Load Balancer ]
   │
   ├──► [ Frontend Service — React/Vite (Kubernetes Pod) ]
   │
   ├──► [ Backend Service — Node.js/Express (Kubernetes Pod) ]
   │         │
   │         ├──► [ PostgreSQL 16 — Kubernetes Pod + DigitalOcean Volume ]
   │         │
   │         └──► [ Image Storage — DigitalOcean Volume (mounted) ]
   │
   └──► [ Email Notification — SMTP (external, Nodemailer) ]
```

### 2.2 Infrastructure

| Component | Technology | Details |
|-----------|------------|---------|
| Cloud Provider | DigitalOcean | Droplet VMs hosting the Kubernetes cluster |
| Orchestration | Kubernetes | Manages pod lifecycle, scaling, and inter-service communication |
| Persistent Storage | DigitalOcean Volumes | Mounted to PostgreSQL pod and backend upload directory |
| Database | PostgreSQL 16 | Schema defined in `db/ddl/ddl.sql`, backed by DigitalOcean Volume |
| Image Storage | Local disk (Volume-mounted) | `backend/storage/uploads/` served as static files |
| Email Delivery | SMTP via Nodemailer | Configurable via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| Monitoring | DigitalOcean Monitoring | CPU usage and application health tracked via built-in tooling |

### 2.3 Environment Configuration

The backend reads configuration from environment variables. The following must be set in production:

**Backend:**
```
NODE_ENV=production
PORT=3001
API_BASE_PATH=/api/v1
DATABASE_URL=postgres://<user>:<pass>@<host>:5432/<db>
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
UPLOAD_DIR=storage/uploads
SMTP_HOST=<smtp-server>
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<password>
SMTP_FROM=<from-address>
```

**Frontend:**
```
VITE_API_BASE_URL=https://<your-domain>/api/v1
```

### 2.4 Local Development Setup

```bash
# 1. Start PostgreSQL via Docker
docker run --name ece1779-postgres \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_pass \
  -e POSTGRES_DB=test_db \
  -p 5433:5432 \
  -d postgres:16

# 2. Apply schema
docker exec -i ece1779-postgres psql -U test_user -d test_db < db/ddl/ddl.sql

# 3. Load test fixtures
pip install pyyaml "psycopg[binary]"
python3 db/test/load_test_data.py --config db/test/load_test_data_config.yml

# 4. Start backend (Terminal 2)
cd backend && npm install && npm start

# 5. Start frontend (Terminal 3)
cd frontend && npm install && npm run dev
```

### 2.5 Health Checks

Kubernetes liveness and readiness probes are served at:

- `GET /api/v1/health/live` — confirms the process is running
- `GET /api/v1/health/ready` — confirms the database connection is established

---

## 3. Individual Contributions

| Team Member | Primary Responsibilities |
|-------------|--------------------------|
| Tianchi Chen | Buyer-facing API endpoints; listing search and filtering logic with multi-parameter query support; buyer preferences CRUD API |
| Noubar Nakhnikian | Seller API endpoints; frontend interface implementation; test data generation and test data loading infrastructure (`db/test/`) |
| Yujie Qin | Seller API endpoints; frontend interface implementation (Seller Dashboard, Buyer Browse pages, listing detail view); email notification database schema design |
| Yuechen Zhang | Application architecture and database schema design; JWT authentication system and RBAC middleware; token refresh flow; email notification backend service implementation |
| All Members | Application integration, end-to-end debugging, Kubernetes deployment configuration, and monitoring setup |

### Contribution Details

**Tianchi Chen** designed and implemented the public listing browsing endpoint, which supports server-side filtering across make, model, year, price, mileage, and color parameters. He built the buyer preferences API, enabling buyers to create and manage vehicle alert criteria that power the email notification system. His work on multi-parameter query construction ensured filter results are deterministic and that removed or unpublished listings never surface in public searches.

**Noubar Nakhnikian** implemented the seller-facing API endpoints for the full listing lifecycle — create, update, delete, publish, and unpublish — as well as the image upload and delete endpoints. He also built the test data infrastructure: CSV fixture files covering users, listings, preferences, and images, alongside the Python loader script and its configuration file. This tooling gave every team member access to a consistent and realistic dataset throughout development.

**Yujie Qin** built the React frontend pages for both the Seller Dashboard (listing creation, editing, image management, and publish/unpublish controls) and the Buyer Browse experience (listing cards, search, sort, pagination, and listing detail view). Yujie also contributed to the seller API layer and designed the `listing_notifications` database schema that prevents duplicate email delivery through a `UNIQUE(listing_id, buyer_id)` constraint.

**Yuechen Zhang** led the overall system architecture and PostgreSQL schema design. He implemented the JWT authentication flow — covering signup, login, token refresh, logout, and the user profile endpoint — as well as bcrypt password hashing and the RBAC middleware layer (`requireRole` and `requireListingOwner`). He was also responsible for the Nodemailer-based email notification service, which matches newly published listings against stored buyer preferences and dispatches alerts accordingly.

---

## 4. Lessons Learned and Concluding Remarks

### 4.1 Lessons Learned

**Clear ownership prevents integration pain.** Dividing work by system layer from the very beginning — database, backend, and frontend — kept merge conflicts rare and integration predictable. When each member owned a well-defined slice of the codebase, it was straightforward to identify who should resolve a given issue and how components should connect. Teams that defer this kind of structural agreement tend to pay for it during integration, so establishing ownership early was one of the most effective decisions we made.

**JWT authentication requires an agreed contract before coding begins.** Implementing secure token refresh flows and properly scoping RBAC middleware to protect API endpoints turned out to be more involved than anticipated. Early ambiguity around access token expiry and the refresh flow introduced frontend bugs that took disproportionate time to diagnose. Writing out a shared authentication contract — covering token lifetimes, storage strategy, and expected HTTP responses — before splitting implementation work would have avoided most of these issues.

**Email notification systems carry hidden complexity.** Integrating the SMTP email service with the listing publish flow surfaced problems that were not visible during design: deduplication of notifications had to be enforced at the database level via a `UNIQUE(listing_id, buyer_id)` constraint on the `listing_notifications` table; SMTP configuration differed across environments and required careful parameterization; and the ordering dependency between persisting a listing and firing notifications introduced a subtle runtime risk in the initial implementation. These are the kinds of edge cases that only become apparent when the system is running end-to-end.


### 4.2 Concluding Remarks

OpenMotor successfully delivers a functioning, cloud-native used-car marketplace that covers the full project scope: structured seller listing management with photo uploads, buyer discovery with multi-dimensional filtering and sorting, JWT-based authentication with role separation, and an automated email notification system that alerts buyers when new listings match their saved preferences. The platform is built on a production-appropriate technology stack — Node.js/Express, React, PostgreSQL, and Kubernetes on DigitalOcean — with a clean separation of concerns across all layers.

A few things are worth improving in future iterations. The report action currently removes listings immediately with no moderation review, pagination and filtering are partially client-side, and there is no CI/CD pipeline. Beyond these, several features would meaningfully extend the platform: a direct messaging channel between buyers and sellers would remove the current dependency on contact email; an order and transaction system could formalize the purchase flow end-to-end; and a seller analytics dashboard — consolidating listing performance, view counts, and inquiry history — would give sellers a clearer picture of how their inventory is doing. These are natural next steps for the platform to evolve from a listing board into a more complete marketplace.

Overall, the project provided meaningful hands-on experience with cloud-native architecture decisions, stateful deployment on Kubernetes with persistent volumes, secure API design, and full-stack integration — all skills that translate directly to modern software engineering practice.
