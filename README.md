# ECE1779 Project Report Team 26 - OpenMotor

Demo Video At: https://www.youtube.com/watch?v=heazmL86sIQ

## 1. Team Information

Noubar Nakhnikian - 1002995100 - noubar.nakhnikian@mail.utoronto.ca

Yujie Qin - 1000703839 - yujie.qin@mail.utoronto.ca

Yuechen Zhang - 1004810074 - joeyuechen.zhang@mail.utoronto.ca

Tianchi Chen - 1003224799 - tianchi.chen@mail.utoronto.ca

## 2. Motivation

We chose this project because everyone has used websites like AutoTrader or FB Marketplace to browse for and buy used vehicles and we have all faced similar experiences with private dealers, excessive ads and spam, leading to an inefficient and unsatisfactory experience. OpenMotor was created to address these problems and create an easy, safe and efficient used car marketplace, for both buyers and sellers. 

## 3. Objectives

The objective of this project is to develop a secure, scalable, and high-performance cloud-based vehicle trading platform that provides individuals with a faster and safer way to buy and sell vehicles.
- The platform will incorporate a customizable search and preference-matching system to enhance discovery efficiency and user experience.
- It will support structured listing lifecycle management with controlled status transitions (draft, published, flagged, removed), enforce strong data validation rules and implement role-based access control to ensure proper ownership.
- The system will also support multi-photo uploads with correctly stored and linked metadata.
- In addition, it will deliver reliable browsing, filtering, sorting, and pagination capabilities with deterministic results and accurate metadata.
- There will be two advanced features implemented: user authentication and authorization to provide secure access control, and email notifications for buyers to alert them of new listings matching their preferences.

Overall, the project aims to build a cloud-native marketplace solution that emphasizes security, scalability, data integrity and user-centered design.


## 4. Technical Stack
   
#### Deployment provider
- We use DigitalOcean Droplet VMs to host the application.
- DigitalOcean Volumes were attached to store persistent data such as PostgreSQL data and user-uploaded images.

#### Orchestration with Kubernetes
- We utilized Kubernetes to orchestrate the application components, including the frontend, backend, database, and background worker for email notifications.
- Kubernetes services were also used to manage communication between the components and ensure scalability and reliability.

#### Backend Service with Node.js and Express
- The backend API was implemented using Node.js and Express framework.
- The backend service was designed to contain authentication and routing to handle user requests from different roles (buying or selling cars)

#### Frontend Service with React
- React was used to build the frontend service for user interaction.

#### Persistent Storage with DigitalOcean Volumes
- DigitalOcean Volumes were chosen for our persistent storage using Persistent Volume Chains (PVCs).
- One PVC was set up to store PostgreSQL data.
- A second PVC was set up to store user-uploaded images for car listings.

#### Monitoring Setup
- DigitalOcean monitoring tools are used to track CPU usage and application health across the DigitalOcean Droplets and the Kubernetes cluster.

#### Advanced Feature 1: User Authentication and Authorization 
- User registration and login functionality were implemented using JWT for secure authentication.
- RBAC was implemented to restrict API access based on user roles.
- We ensured that, based on their roles as either buyers or sellers, users only see the webpage relevant to them.
- A database schema was designed to store user authentication and role information.

#### Advanced Feature 2: Email Notifications for Buyers:
- A database schema was created to store buyer preferences for car models and target prices used to trigger email notifications.
- A notification worker service was deployed as a Kubernetes CronJob scheduled to run once per day.
- A third-party email service provider (SendGrid) was integrated to handle email sending and ensure reliable delivery.


## 5. Features

OpenMotor has a variety of features available to make the buying or selling experience on the site easier and more efficient. 

#### Seller Listing Management
- Sellers can create, edit, publish, unpublish, and manage vehicle listings with controlled status transitions (draft, published, flagged, removed).
- Each listing includes vehicle details, contact information, and vehicle photos uploaded by the seller.
- The system validates year, price and mileage, required fields before publishing, and image type/size limits.
- Sellers have full CRUD access to their own listings only, and uploaded photos are properly stored with linked metadata.

#### Buyer Search and Discovery
- Buyers can browse published listings and search efficiently using filters such as make, model, year range, price range, mileage etc.
- Buyers can sort results (newest, price ascending/descending, year), paginate through listings, and view detailed pages.
- The system ensures filter results are deterministic, pagination metadata remains accurate, and removed listings never appear in public searches.

#### User Authentication and Authorization (Advanced Feature 1)
- Users can signup as either buyers or sellers. Based on the user role, the application will provide different frontend interfaces and restrict access to certain API endpoints.
- Users can login to the system using their credentials, and the system will use JWT for secure authentication and session management.

#### Email Notifications for Buyers (Advanced Feature 2)
- Buyers can setup notification alerts for specific used-car models with a target price.
- The email notification runs on a cadence of once every day, where the system will automatically send an to the email containing all the new listings of that day that match the users requested criteria.


## 6. User Guide

### Overview

OpenMotor is a cloud-native used-car marketplace designed for individual buyers and sellers. The platform provides two distinct role-based interfaces: a Seller Hub for managing vehicle listings and a Buyer Browse experience that includes preference-based email alerts. All features are accessible through a standard web browser after registration.

### Getting Started

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

### Seller Workflow

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

### Buyer Workflow

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

## 7. Development Guide

### Database Setup

Navigate to the `db` directory.

#### Setup With Local Postgres

Login to local postgres with
```
psql -U postgres
```
Execute `db/ddl/ddl.sql` to create the database schema.

#### Setup With Docker

Start a local postgres container with
```bash
docker run --name ece1779-postgres \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_pass \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 \
  -d postgres:16
```
Wait for Postgres to be ready:

```bash
docker exec ece1779-postgres pg_isready -U test_user -d test_db
```
Create DB schema

```bash
docker exec -i ece1779-postgres \
  psql -U test_user -d test_db < ddl/ddl.sql
```
#### Optional: Load Test Data
Make sure you have Python 3 and dependencies installed:
```bash
python3 -m pip install pyyaml psycopg[binary]
```
Setup `db/test/load_test_data_config.yml` with your DB connection settings and data directory, then run the loader script:

```bash
python3 test/load_test_data.py \
  --config test/load_test_data_config.yml
```

### Backend Setup

Navigate to the `backend` directory.

#### Install dependencies
```bash
npm install
```
#### Configure environment variables
Use the provided `.env.example` as a template to create a `.env` file with the necessary environment variables for your local development setup.

For example, if you are using the docker Postgres setup, your `.env` might look like:
```
NODE_ENV=development
PORT=3000
API_BASE_PATH=/api/v1
DB_HOST=localhost
DB_PORT=5432
DB_USER=test_user
DB_PASSWORD=test_pass
DB_NAME=test_db
JWT_ACCESS_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
AUTO_FLAG_THRESHOLD=3
UPLOAD_DIR=storage/uploads
```

#### Run the backend server
```bash
npm start
```

#### Optional: Test the backend server
```bash
npm test
```
This will run the unittests defined in the `tests` directory.

### Frontend Setup

Navigate to the `frontend` directory.

#### Install dependencies
```bash
npm install
```

#### Configure environment variables
Create a `.env` file in the `frontend` directory with the following content, adjusting the API URL if your backend is running on a different host or port:
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
PORT=8080
```

#### Run the frontend server
```bash
npm start
```

### Email Notifications
navigate to the `notification_worker` directory.   

#### Install dependencies
```bash
npm install
```

#### Configure environment variables
Use the provided `.env.example` as a template to create a `.env` file with the

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ece1779
SENDGRID_API_KEY=replace-with-sendgrid-api-key
SENDGRID_FROM_EMAIL=notifications@example.com
APP_BASE_URL=http://localhost:5173
```
Replace the `DATABASE_URL` with your actual database connection string, `APP_BASE_URL` with your application's base URL, and set the SendGrid API key and from email address.

#### Run the notification worker
```bash
npm start
```

## 8. Deployment Information
Frontend URL at: http://157.230.69.224:8080/

### Architecture Overview

The application follows a three-tier, cloud-native architecture. Incoming traffic is handled by a DigitalOcean Load Balancer, which routes requests to the appropriate Kubernetes service. The Frontend Service (React/Vite) serves the single-page application, while the Backend Service (Node.js/Express) handles all API requests. The backend connects to a PostgreSQL 16 database pod backed by a DigitalOcean Volume for persistent storage, and reads/writes user-uploaded images from a second Volume-mounted directory. Outbound email is delivered via an external SMTP relay (Nodemailer).

```
Internet
   │
   ▼
[ DigitalOcean Kubernetes Cluster ]
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

### Infrastructure

| Component | Technology | Details |
|-----------|------------|---------|
| Cloud Provider | DigitalOcean | Droplet VMs hosting the Kubernetes cluster |
| Orchestration | Kubernetes | Manages pod lifecycle, scaling, and inter-service communication |
| Persistent Storage | DigitalOcean Volumes | Mounted to PostgreSQL pod and backend upload directory |
| Database | PostgreSQL 16 | Schema defined in `db/ddl/ddl.sql`, backed by DigitalOcean Volume |
| Image Storage | Local disk (Volume-mounted) | `backend/storage/uploads/` served as static files |
| Email Delivery | SMTP via Nodemailer | Configurable via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` |
| Monitoring | DigitalOcean Monitoring | CPU usage and application health tracked via built-in tooling |

### Health Checks

Kubernetes liveness and readiness probes are served at:

- `GET /api/v1/health/live` — confirms the process is running
- `GET /api/v1/health/ready` — confirms the database connection is established

## 9. AI Assistance & Verification Summary
We utilized AI for the following aspects of our project:

### DB Test Data Generation and Ingestion Script
We would like to utilize AI to help us generate test data for our application, which saves us time and effort in creating realistic data for testing our backend API and frontend UI.
To achieve this we:
- Created a prompt that outlined the requirements for the test data, including the types of data we needed (e.g., vehicle listings, user data), the relationships between different data entities, and any specific constraints or formats we wanted to adhere to.
- Utilized the AI to generate CSV files containing the test data based on our prompt, ensuring that the data was consistent with our database schema and relationships.
- Developed a Python script that can load the generated test data into our PostgreSQL database, ensuring that the data is consistent with our database schema and relationships.
- Validated the data integrity and quality by connecting to our PostgreSQL database through a database client (DBeaver) and running queries to confirm that the data was correctly inserted and that the relationships between tables were maintained.

Detailed information about this AI assistance is documented in ai-session.md Session 1.

### Backend API skeleton
We utilized AI to create a template structure as our starting codebase for our backend API development, as
- this helps the team to develop the workload, and also sketched out a clear structure for the backend codebase
- makes it easier for us to collaborate and maintain the code in the future. 
- Validated the generated code structure by reviewing it as a team and ensuring that it aligned with our project requirements and coding standards, and running the application locally to confirm that the basic structure was functional and did not contain any critical errors.

We did not ask the AI to implement the API endpoints, but just to create a template structure for us to work on.

Detailed information about this AI assistance is documented in ai-session.md Session 2.

### Frontend UI Generation

Since our team does not have much experience in frontend development, we leveraged AI to help us generate the UI for our application.
-  We provided the AI with a summary of our backend API endpoints, as well as an overview of the features we wanted to implement in our frontend. 
- We also included an Agent prompt for frontend development, which outlined the guidelines and best practices for frontend development that we wanted the AI to follow when generating the UI.
- We validated the generated UI by running the frontend application locally and testing the various features and interactions to ensure that they worked as expected, provided a good user experience and does not have connectivity issues with the backend API.

Detailed information about this AI assistance is documented in ai-session.md Session 3.

### Testing, Debugging and Troubleshooting
We utilized AI to implement test cases for our backend API, which helped us to ensure that our API endpoints were functioning correctly and that our application was robust and reliable.

We also utilized AI to solve various bugs and issues that we encountered during our development and deployment processes, which helped us to identify and resolve problems in our codebase. Debugging topics included:
- Issues with Docker containerization and Kubernetes deployment
- Problems with image upload endpoint functionality and integration with the frontend
- Errors in our backend API endpoints and database configurations
We validated the solutions provided by the AI by implementing the suggested fixes in our codebase, running the application both locally and in our Kubernetes cluster, and testing the relevant features to confirm that the issues were resolved and that the application was functioning correctly.

## 10. Individual Contributions

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

## 11. Lessons Learned and Concluding Remarks

### Lessons Learned

**Clear ownership prevents integration pain.** Dividing work by system layer from the very beginning — database, backend, and frontend — kept merge conflicts rare and integration predictable. When each member owned a well-defined slice of the codebase, it was straightforward to identify who should resolve a given issue and how components should connect. Teams that defer this kind of structural agreement tend to pay for it during integration, so establishing ownership early was one of the most effective decisions we made.

**JWT authentication requires an agreed contract before coding begins.** Implementing secure token refresh flows and properly scoping RBAC middleware to protect API endpoints turned out to be more involved than anticipated. Early ambiguity around access token expiry and the refresh flow introduced frontend bugs that took disproportionate time to diagnose. Writing out a shared authentication contract — covering token lifetimes, storage strategy, and expected HTTP responses — before splitting implementation work would have avoided most of these issues.

**Email notification systems carry hidden complexity.** Integrating the SMTP email service with the listing publish flow surfaced problems that were not visible during design: deduplication of notifications had to be enforced at the database level via a `UNIQUE(listing_id, buyer_id)` constraint on the `listing_notifications` table; SMTP configuration differed across environments and required careful parameterization; and the ordering dependency between persisting a listing and firing notifications introduced a subtle runtime risk in the initial implementation. These are the kinds of edge cases that only become apparent when the system is running end-to-end.


### Concluding Remarks

OpenMotor successfully delivers a functioning, cloud-native used-car marketplace that covers the full project scope: structured seller listing management with photo uploads, buyer discovery with multi-dimensional filtering and sorting, JWT-based authentication with role separation, and an automated email notification system that alerts buyers when new listings match their saved preferences. The platform is built on a production-appropriate technology stack — Node.js/Express, React, PostgreSQL, and Kubernetes on DigitalOcean — with a clean separation of concerns across all layers.

A few things are worth improving in future iterations. The report action currently removes listings immediately with no moderation review, pagination and filtering are partially client-side, and there is no CI/CD pipeline. Beyond these, several features would meaningfully extend the platform: a direct messaging channel between buyers and sellers would remove the current dependency on contact email; an order and transaction system could formalize the purchase flow end-to-end; and a seller analytics dashboard — consolidating listing performance, view counts, and inquiry history — would give sellers a clearer picture of how their inventory is doing. These are natural next steps for the platform to evolve from a listing board into a more complete marketplace.

Overall, the project provided meaningful hands-on experience with cloud-native architecture decisions, stateful deployment on Kubernetes with persistent volumes, secure API design, and full-stack integration — all skills that translate directly to modern software engineering practice.
