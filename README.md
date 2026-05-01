# 🏎️ F1 Fantasy League

A personal full-stack web application inspired by the official F1 Fantasy game. Build your own Formula 1 dream team, compete against friends, and earn points based on real race results — all powered by live F1 data.

---

## 🚀 Overview

F1 Fantasy League lets you:
- **Create an account** and securely log in
- **Pick your team** — 2 current F1 drivers + 1 constructor
- **Earn points** automatically after each race based on real finishing positions
- **Update your team** at any time from your profile page
- **Compete in a private league** against your friends

Points are fetched from the [OpenF1 API](https://github.com/br-g/openf1) and updated every Monday at 6:00 PM using a scheduled cron job.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Backend** | Express.js |
| **Database** | PostgreSQL (via `pg`) |
| **Frontend** | HTML, CSS, JavaScript |
| **Auth** | bcrypt (password hashing), express-session |
| **3D / Animations** | Three.js, GSAP, Postprocessing |
| **Race Data** | [OpenF1 API](https://openf1.org) |
| **Scheduling** | node-cron |
| **Containerisation** | Docker + Docker Compose |

---

## 📁 Project Structure

```
F1-Fantasy-League/
├── server.js                  # Express server & all API routes
├── generatePasswordToken.js   # Password reset token utility
├── Dockerfile                 # Docker image definition
├── compose.yaml               # Docker Compose config
├── package.json
└── public/
    ├── index.html             # Landing / login page
    ├── newUser.html           # New user registration page
    ├── returningUser.html     # Returning user login page
    ├── profilePage.html       # User profile & team display
    ├── alterTeam.html         # Team selection / update page
    ├── resetPasswordPage.html # Password reset page
    ├── updatePassword.html    # New password entry page
    ├── styles.css             # Global styles
    ├── profilePage.css        # Profile page styles
    ├── logIn.js               # Login frontend logic
    ├── newUserInfo.js         # Registration frontend logic
    ├── SQL_functions.js       # All PostgreSQL query functions
    └── pullRaceResults.js     # Race result parsing & points conversion
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [PostgreSQL](https://www.postgresql.org/) database
- (Optional) [Docker](https://www.docker.com/) for containerised setup

### 1. Clone the repo

```bash
git clone https://github.com/kealan-doherty/F1-Fantasy-League.git
cd F1-Fantasy-League
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root of the project:

```env
SESSION_SERCRET=your_session_secret
DB_KEY=your_database_password
DB_HOST=your_database_host
DB_USER=your_database_user
DB_NAME=your_database_name
```

### 4. Set up the database

Ensure your PostgreSQL instance has a table called `"USER INFO"` with the following columns:

| Column | Type |
|---|---|
| `username` | TEXT |
| `password` | TEXT |
| `email` | TEXT |
| `code` | TEXT |
| `points` | INTEGER |
| `first_driver` | TEXT |
| `second_driver` | TEXT |
| `constructor` | TEXT |

### 5. Run the app

```bash
node server.js
```

Visit `http://localhost:3000` in your browser.

---

## 🐳 Running with Docker

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

> **Note:** You will still need a running PostgreSQL instance and a populated `.env` file for the app to connect to the database.

---

## 🏁 Points System

Points are awarded based on official F1 finishing positions:

| Position | Points |
|---|---|
| 1st | 25 |
| 2nd | 18 |
| 3rd | 15 |
| 4th | 12 |
| 5th | 10 |
| 6th | 8 |
| 7th | 6 |
| 8th | 4 |
| 9th | 2 |
| 10th | 1 |

Scores are fetched from the OpenF1 API and automatically applied to all users whose selected drivers finish in the top 10. The update runs every **Monday at 18:00** via a cron job.

---

## 🗺️ API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Serve landing page |
| `POST` | `/submit` | Register a new user |
| `POST` | `/sign-in` | Log in an existing user |
| `GET` | `/profilePage` | Serve profile page |
| `GET` | `/userData` | Return logged-in user's team data |
| `POST` | `/updateTeam` | Update user's drivers & constructor |
| `POST` | `/username` | Return the current session username |
| `GET` | `/updatePassword` | Serve the update password page |
| `POST` | `/resetPasswordConfirm` | Confirm and save a new password |
| `POST` | `/resetInfo` | Initiate password reset via code |

---

## 🔒 Security

- User passwords and emails are hashed with **bcrypt** before being stored in the database
- Sessions are managed server-side with **express-session**
- Password reset currently uses a user-set secret code (full email-based reset flow planned for future deployment)

---

## 🚧 Roadmap

- [ ] Full email-based password reset flow
- [ ] League system — invite friends with a code and view a shared leaderboard
- [ ] Qualifying & sprint race points
- [ ] Constructor points scoring
- [ ] UI overhaul — cleaner, more polished design
- [ ] Deployment to a live hosting platform

---

## 📡 Data Source

Live race data is sourced from the **[OpenF1 API](https://openf1.org)** — a free, open-source API providing real-time and historical Formula 1 data.

---

## 👤 Author

**Kealan Doherty** — [GitHub](https://github.com/kealan-doherty)
