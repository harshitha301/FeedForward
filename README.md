# 🌱 FeedForward – Smart Surplus Food Donation & Redistribution Platform

**Good Food. Better Impact.**

FeedForward is a web-based food donation platform designed to connect food donors with organizations that support people in need, such as orphanages, old-age homes, shelters, and NGOs. The platform helps redistribute surplus food, reduce food waste, and encourage community participation.

## 📌 Problem Statement

Large amounts of edible food are wasted by households, events, and other food donors, while many people and communities struggle to access sufficient food. Traditional donation methods can make it difficult to find suitable recipients and coordinate food collection.

FeedForward provides a centralized platform where donors can share surplus food and recipient organizations can request available donations.

## 🎯 Objectives

- Reduce avoidable food waste.
- Connect food donors with recipient organizations.
- Make food donation and collection easier to coordinate.
- Support transparent donation request management.
- Encourage responsible food sharing and community service.

## ✨ Key Features

### 👤 User Authentication
- Account registration and login.
- Separate donor and recipient organization roles.
- Role-based access to platform features.

### 🍱 Food Donation Management
- Donors can publish surplus food donations.
- Add food details, quantity, location, and expiry information.
- Upload food images.
- View and manage submitted donations.

### 🤝 Organization Requests
- Organizations can browse available food donations.
- Submit requests for suitable donations.
- Track request status.
- Donors can approve or reject requests.

### 🚚 Pickup and Delivery Tracking
- Organizations can update the pickup and delivery status.
- Users can follow the progress of donation requests.

### 🛡️ Admin Dashboard
- View platform statistics.
- Manage and verify recipient organizations.
- Support responsible platform administration.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | SQLite |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| API Communication | Axios |
| Development Tools | VS Code, Git, GitHub |

## 🏗️ System Architecture

```text
Donors / Recipient Organizations / Admin
                    |
                    v
             React Frontend
                    |
                    v
              Axios REST API
                    |
                    v
          Node.js + Express Backend
                    |
                    v
              SQLite Database
```

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Git
- Visual Studio Code (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/harshitha301/FeedForward.git
cd FeedForward
```

### 2. Install frontend dependencies

Open a terminal in the project root:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Check the backend configuration and create the required `.env` file if the application expects one. Keep secret keys and credentials private. Never commit `.env` files to GitHub.

### 5. Start the backend

From the `backend` directory, run the development command defined in `backend/package.json`. If a `dev` script is configured, use:

```bash
npm run dev
```

### 6. Start the frontend

Open a second terminal in the project root:

```bash
cd path/to/FeedForward
npm run dev
```

Open the local URL displayed by Vite in your terminal.

**Note:** Configure the terminal path and environment variables according to your local project setup. The frontend and backend must both be running for API-based features to work.

## 🔄 Application Workflow

1. A donor registers or logs in.
2. The donor publishes a surplus food donation.
3. A recipient organization registers and completes the required verification process.
4. The organization browses available donations and submits a request.
5. The donor approves or rejects the request.
6. The organization updates pickup and delivery status.
7. The administrator manages platform statistics and organization verification.

## 🌍 Social Impact

FeedForward aims to:

- Encourage food redistribution instead of unnecessary disposal.
- Connect surplus food with organizations serving communities in need.
- Improve coordination between donors and recipients.
- Promote a culture of sharing and social responsibility.

## 🚀 Future Enhancements

- Email and SMS notifications.
- Map-based donor and recipient discovery.
- Food donation matching based on location and expiry time.
- Donation analytics and impact reports.
- Cloud deployment and secure image storage.
- Mobile-friendly enhancements and accessibility improvements.

## 🔐 Security Considerations

- Keep passwords and secret keys out of source control.
- Use role-based authorization for protected routes.
- Verify organizations before allowing restricted activities.
- Validate user input and donation details.
- Use HTTPS and secure configuration in production.

## 👩‍💻 Project Information

**Project Name:** FeedForward  
**Project Type:** Full-Stack Web Application  
**Domain:** Social Impact, Food Donation and Waste Reduction  
**Repository:** [GitHub – FeedForward](https://github.com/harshitha301/FeedForward)

## ❤️ Conclusion

FeedForward demonstrates how web technologies can support food donation and redistribution by connecting donors, recipient organizations, and administrators through a centralized platform.

**Good Food. Better Impact.**