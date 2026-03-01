ECE1779 - Winter 2026
Team 26 - Tianchi Chen, Noubar Nakhnikian, Yujie Qin, Yuechen Zhang

# Motivation
## Problem Statement
The current used car market is highly fragmented and often inefficient for individual buyers and sellers. Many existing car trading platforms are saturated with private dealers, excessive advertisements, potential scams, and high service fees. Most systems focus only on transactions and do not support structures, long-term vehicle record management.

## Project Value
Car owners lack a centralized system to store vehicle profiles (make, model, year, VIN), track mileage and expenses, and maintain organized records for resale. Buyers also face limited filtering flexibility when searching for vehicles by brand, year, type, mileage, price, or color. These gaps reduce transparency, trust, and decision-making efficiency. This project proposes a cloud-native car management and trading platform that integrates structured vehicle lifecycle tracking with a searchable used-car marketplace.

## Target Users
The target users are adults who are either seeking to purchase a used vehicle or looking to sell their current one. 

## Solution Overview
The platform improves transparency by allowing sellers to create detailed listings with photos and structured vehicle data, while enabling buyers to filter vehicles across multiple dimensions. It also supports long-term vehicle management beyond a single transaction. The system is built using a stateful cloud-native architecture with containerized services (Docker with Kubernetes), PostgreSQL for persistent structured data, attached cloud volumes for image storage, and deployment on DigitalOcean. To ensure reliability and production readiness.

# Objectives and Key Features

## Project Objectives
- The objective of this project is to develop a secure, scalable, and high-performance cloud-based vehicle trading platform that provides individuals with a faster and safer way to buy and sell vehicles.
- The platform will incorporate a customizable search and preference-matching system to enhance discovery efficiency and user experience. 
- It will support structured listing lifecycle management with controlled status transitions (draft, published, flagged, removed), enforce strong data validation rules and implement role-based access control to ensure proper ownership. 
- The system will also support multi-photo uploads with correctly stored and linked metadata. 
- In addition, it will deliver reliable browsing, filtering, sorting, and pagination capabilities with deterministic results and accurate metadata. 
- There will be two advanced features implemented: user authentication and authorization to provide secure access control, and email notifications for buyers to alert them of new listings matching their preferences.
- Overall, the project aims to build a cloud-native marketplace solution that emphasizes security, scalability, data integrity and user-centered design.

## Project Scope
- The project scope is to build a used-car listing platform, with user authentication and email notifications.
- This project will be built using Node.js and Express for the backend, React for the frontend, and PostgreSQL for the database.
- The application will be deployed on DigitalOcean using Kubernetes for orchestration, and DigitalOcean Volumes for persistent storage.

## Project Feasibility
- The project scope is realistic for a team of 4 members within the given timeline. The techinical requirements are well-defined and align with the course project requirements to use Kubernetes, DigitalOcean, and persistent storage with monitoring setup. 
- The advanced features of user authentication and email notifications are also feasible to implement within the timeframe, given that the team has done research on the necessary technologies and has a clear plan for implementation.

## Project Key Features

### Application Features

#### Seller Listing Management
- Sellers can create, edit, publish, unpublish, and manage vehicle listings with controlled status transitions (draft, published, flagged, removed). 
- Each listing includes vehicle details, contact information, and vehicle photos uploaded by the seller. 
- The system validates yearly range, non-negative price and mileage, required fields before publishing, and image type/size limits. 
- Sellers have full CRUD access to their own listings only, and uploaded photos are properly stored with linked metadata.

#### Buyer Search and Discovery
- Buyers can browse published listings and search efficiently using filters such as make, model, year range, price range, mileage etc.
- Buyers can sort results (newest, price ascending/descending, year), paginate through listings, and view detailed pages. 
- The system ensures filter results are deterministic, pagination metadata remains accurate, and removed listings never appear in public searches.

#### Advanced Feature 1: User Authentication and Authorization
- Users can signup as either buyers or sellers. Based on the user role, the application will provide different frontend interfaces and restrict access to certain API endpoints.
- Users can login to the system using their credentials, and the system will use JWT for secure authentication and session management.

#### Advanced Feature 2: Email Notifications for Buyers 
- Buyers can setup alert for specific used-car models with target price.
- When a new listing matches the criteria, the system will send an email notification to the buyer.

### Technical Features

#### Deployment provider
- Use DigitalOcean Droplet VMs to host the application.
- Attach DigitalOcean Volumes to store persistent data such as postgrees data and user-uploaded images.
- This aligns with the requirement to use cloud provider for deploying the application.

#### Orchestration with Kubernetes
- Use Kubernetes to orchestrate the application components, including the frontend, backend, database, and background worker for email notifications.
- Use Kubernetes services to manage communication between components and ensure scalability and reliability.
- This aligns with the requirement to use Kubernetes/Docker Swarm for orchestration.

#### Backend Service with Node.js and Express
- Implement the backend API using Node.js and Express framework.

#### Frontend Service with React
- Implement the frontend interface using React.

#### Persistent Storage with DigitalOcean Volumes 
- Use DigitalOcean Volumes to store PostgreSQL data.
- Use DigitalOcean Volumes to store user-uploaded images for car listings.
- This aligns with the requirement to use database and persistent storage for stateful data.

#### Monitoring Setup
- Monitor DigitalOcean Droplets and Kubernetes cluster using DigitalOcean monitoring tools to track cpu usage and application health.
- This aligns with the requirement to set up monitoring for the deployed application.

#### Technical Feature for Advanced Feature 1:
- Implement user registration and login functionality using JWT for secure authentication.
- Implement RBAC to restrict API access based on user roles.
- Implement different frontend interfaces for buyers and sellers, to ensure that users only see the webpage relevant to their role.
- Design a database schema for storing user authentication information and role information.

#### Technical Feature for Advanced Feature 2: 
- Implement a database schema to store buyer preferences for car models and target prices for triggering email notification conditions.
- Implement a background scheduled task to check for new listings and trigger email notifications when criteria are met.
- Use a third-party email service provider (e.g., *SendGrid*) to handle email sending and ensure reliable delivery.

### Database Schema Sketch
1. Users Table
- user_id (primary key)
- username
- email
- phone_number
- password_hash
- role (buyer or seller)

2. Car Listings Table
- car_id 
- seller_id (foreign key referencing Users)
- make
- model 
- year
- price
- description
- image_path

3. Buyer Preferences Table
- preference_id (primary key)
- buyer_id (foreign key referencing Users)
- model
- target_price_low
- target_price_high
- year_low
- year_high
- created_at
- updated_at
- is_active

4. Email Notifications Table
- notification_id (primary key)
- buyer_id (foreign key referencing Users)
- preference_id (foreign key referencing Buyer Preferences)
- car_ids (array of car_id that triggered the notification)
- matched_at

# Tentative Plan

# Initial Independent Reasoning (Before Using AI)

## Architecture Choices
### Provider
Our initial decision is to use DigitalOcean as our cloud provider because it offers a straightforward and easy to use interface. Additionally DigitalOcean was an easy choice because we experience using the service from lectures and assignments.

### Orchestration
We decided on Kubernetes for orchestrating our application components. Our reasoning was that Kubernetes is widely used in industry and supports automatic scaling and self-healing. Kubernetes also makes it easier to manage multiple services (frontend, backend, database) and to ensure reliable communication between them.

### Persistent Storage
We selected DigitalOcean Volumes for persistent storage. This allows us to keep our PostgreSQL database and user-uploaded images safe, even if our application was restarted or rescheduled. Using cloud-based persistent volumes also means we didn’t have to worry about losing stateful data, which is crucial for a marketplace type platform.

## Anticipated Challenges

### User Authentication and Authorization:
Implementing secure authentication, role-based access control (RBAC), and session management is new territory for most of our team. We anticipated difficulties in properly hashing passwords, securely storing credentials, and restricting API access to certain endpoints. 

### Email Notification System:
Setting up automated email notifications based on user preferences requires integrating with a third-party service (like SendGrid), scheduling background tasks, and ensuring reliable delivery. We expect to face challenges with setting this up aswell as integrating it, as none of us have experience with this software.



# AI Assistance Disclosure
