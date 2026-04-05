# SRCT – Smart Request Categorization Tool

SRCT is a web app for submitting complaints/requests, automatically categorizing them, assigning them to admins, and tracking resolution status.

## Features
- User/admin authentication
- Complaint submission with automatic categorization
- Role-based dashboards
- Status tracking and admin remarks
- Notification drawer for updates

## Tech Stack
- Frontend: React
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)

## Project Structure
- `client/` – React app
- `server/` – API server

## Setup
### Backend
1. `cd server`
2. Create `.env` with:
   - `MONGO_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_secret`
   - `PORT=5000`
3. `npm install`
4. `npm run dev`

### Frontend
1. `cd client`
2. `npm install`
3. `npm start`

## Default URLs
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
