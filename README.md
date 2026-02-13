# Smart Request Categorization Tool (SRCT)

## Software Requirements Specification (Corrected)

### 1. Introduction

#### 1.1 Purpose
The Smart Request Categorization Tool is a web-based system for submitting, categorizing, assigning, and resolving complaints/requests. It reduces manual routing effort by automatically classifying requests and directing them to relevant admins.

#### 1.2 Scope
The system provides:
- Common authentication for users and admins
- Complaint/request submission by users
- Automatic category detection from description text
- Role-based dashboards
- Complaint status tracking (New, In Progress, Solved)
- Admin remarks and user visibility of updates
- Secure API access with JWT

### 2. Overall Description

#### 2.1 Product Perspective
The application has three layers:
- Frontend: React.js
- Backend: Node.js + Express.js REST API
- Database: MongoDB with Mongoose

#### 2.2 Product Functions
- Register and login for user/admin roles
- Submit complaint with title + description
- Auto-categorize complaint (`Networking`, `Fees`, `Discipline`, `General`)
- Assign complaint to matching admin domain where possible
- User dashboard for tracking complaints and remarks
- Admin dashboard for filtering/managing assigned complaints
- Status and remarks updates by admin

#### 2.3 User Characteristics
- Basic computer literacy
- Familiarity with browser-based forms
- No programming knowledge required

#### 2.4 Constraints
- Internet required for deployed usage
- Requires MongoDB connection (`MONGO_URI`)
- Initial categorization is keyword-based

### 3. Specific Requirements

#### 3.1 Functional Requirements

##### 3.1.1 Authentication & Roles
- System supports `user` and `admin` roles.
- System redirects user/admin to corresponding dashboards after login.

##### 3.1.2 Complaint Registration
- User enters title and description.
- System generates unique `requestId` and timestamps.
- Initial status is `New`.

##### 3.1.3 Smart Categorization
- System categorizes by keyword analysis.
- System attempts domain-based admin assignment.

##### 3.1.4 User Dashboard
- View own complaints with category, status, and admin remarks.

##### 3.1.5 Admin Dashboard
- View complaints by category/domain.
- Update status (`New`, `In Progress`, `Solved`).
- Add remarks visible to users.

#### 3.2 Non-Functional Requirements
- Performance: responsive API interactions
- Usability: simple UI and forms
- Reliability: persistent complaint records
- Scalability: add more categories/admin domains later
- Maintainability: modular route/controller/model structure

#### 3.3 Database Requirements

##### Users
- `name`
- `email` (unique)
- `password` (hashed)
- `role` (`user` / `admin`)
- `adminDomain` (for admin routing)

##### Complaints
- `requestId` (unique)
- `userId`
- `title`
- `description`
- `category`
- `status`
- `adminRemarks`
- `adminId`
- `createdAt`, `updatedAt`

### 4. System Workflow
1. User/admin logs in.
2. User submits complaint.
3. System categorizes and assigns complaint.
4. Admin reviews and updates status/remarks.
5. User tracks progress in dashboard.

### 5. Technology Stack
- Frontend: React, Axios, React Router
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Security: JWT, bcrypt
- Testing/Tools: Postman, VS Code, Git/GitHub

## API Summary

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### User Complaints
- `POST /api/complaints` (auth)
- `GET /api/complaints` (auth)

### Admin
- `GET /api/admin/complaints` (admin auth)
- `PUT /api/admin/complaint/:id` (admin auth)
- `PUT /api/admin/complaint/:id/remarks` (admin auth)

## Run Instructions

### Backend
1. `cd server`
2. Create `.env` with:
   - `MONGO_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_secret`
3. `npm install`
4. `npm run dev`

### Frontend
1. `cd client`
2. `npm install`
3. `npm start`

Default URLs:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
