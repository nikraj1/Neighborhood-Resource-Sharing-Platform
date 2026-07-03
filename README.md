# 🏙️ Neighborhood Resource Sharing Platform (NearShare)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Frontend](https://img.shields.io/badge/frontend-React%20%7C%20Vite-61DAFB.svg)
![Backend](https://img.shields.io/badge/backend-Spring%20Boot-6DB33F.svg)

Welcome to **NearShare** — a modern, community-driven platform designed to make neighborhood resource sharing seamless, secure, and intuitive. Whether you need a drill for a weekend project or want to lend out your unused camping gear, NearShare connects you with your neighbors!

---

## ✨ Features

- **🔍 Local Discovery:** Browse items available for rent in your immediate neighborhood with intuitive filtering and search.
- **🤝 Secure Borrowing & Lending:** Easy-to-use workflows for requesting items, approving rentals, and tracking handover status.
- **💳 Built-in Wallet System:** Manage simulated payments, deposits, and earnings through a secure virtual wallet.
- **📱 QR Code Handovers:** Scan QR codes during item pickup and return for verifiable, friction-free handovers.
- **🎨 Modern UI/UX:** A stunning, responsive interface built with Tailwind CSS and Shadcn UI components.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Shadcn UI
- **Routing:** React Router DOM
- **Data Fetching:** TanStack React Query
- **Maps:** Leaflet & React-Leaflet

### Backend
- **Framework:** Java Spring Boot 3
- **Data Access:** Spring Data JPA
- **Database:** H2 Database (In-Memory for Dev) / PostgreSQL (Production)
- **Security:** Spring Security
- **Build Tool:** Maven

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Java Development Kit (JDK) 21](https://jdk.java.net/21/)
- [Maven](https://maven.apache.org/)

### 1. Setting up the Backend
1. Navigate to the backend directory:
   ```bash
   cd neighborhood-resource-sharing-backend/api
   ```
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start on `http://localhost:8080`.

### 2. Setting up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd neighborhood-resource-sharing-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:8081`.

---

## 🏗️ Project Structure

```text
Neighborhood Resource Sharing Platform/
├── neighborhood-resource-sharing-backend/
│   └── api/                # Spring Boot REST API
│       ├── src/main/java   # Java source files (Controllers, Services, Repositories)
│       └── pom.xml         # Maven dependencies
├── neighborhood-resource-sharing-frontend/
│   ├── src/                # React source files (Components, Pages, Hooks)
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies and scripts
└── README.md               # Project documentation
```

---

## 🤝 Contributing
Contributions are always welcome! Please feel free to submit a Pull Request or open an Issue if you encounter any bugs or have feature requests.

## 📄 License
This project is licensed under the MIT License.
