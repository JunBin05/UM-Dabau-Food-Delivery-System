# UM Food Delivery System

**WIA1002 OCC7 GROUP7**

Campus Navigation & Order Management System

---

## System Overview

The UM Food Delivery System is a full-stack campus food ordering and delivery management application for Universiti Malaya. The system supports food ordering, restaurant/menu browsing, cart management, order handling, and campus navigation features.

The project is organized as two independent applications:

- `backend/` - Java Spring Boot application using Maven
- `frontend/` - React application using npm

The backend provides REST API services and seeded testing data, while the frontend provides the user interface for interacting with the food delivery system.

---

## Prerequisites

Please make sure the following software is installed before running the project:

- Java JDK 21 or above
- Node.js v18 or above
- npm
- Maven

You can verify the installations with:

```bash
java -version
mvn -version
node -v
npm -v
```

---

## One-Click Execution

For examiner convenience, this project includes launcher scripts in the root project directory.

### Windows

Double-click:

```text
run_windows.bat
```

The script will:

1. Open a new terminal window for the Spring Boot backend.
2. Start the backend from `backend/`.
3. Open a new terminal window for the React frontend.
4. Install frontend dependencies if needed.
5. Start the frontend from `frontend/`.
6. Open the frontend automatically in the browser.

### macOS / Linux

Allow the script to run, then launch it from the project root:

```bash
chmod +x run_mac_linux.sh
./run_mac_linux.sh
```

After permission is granted, you may also double-click `run_mac_linux.sh` in file managers that support running executable shell scripts. The script will start the backend and frontend in separate terminal windows where supported, then open the frontend automatically in the browser.

Default local URLs:

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`

---

## Manual Execution Fallback

If the one-click scripts do not run on your machine, start the applications manually.

### 1. Start Backend

Open a terminal in the project root:

```bash
cd backend
mvn spring-boot:run
```

Wait until the backend starts at:

```text
http://localhost:8080
```

Keep this terminal open.

### 2. Start Frontend

Open a second terminal in the project root:

```bash
cd frontend
npm install
npm start
```

Open the frontend in your browser:

```text
http://localhost:5173
```

---

## Testing Credentials and Sample IDs

The seeded data can be used to test major data structures and system flows.

| Role / Data Type | Sample ID | Suggested Use |
| --- | --- | --- |
| Admin | `A-01` | Admin-related testing and system management checks |
| User | `U-123` | User login/order/cart workflow testing |
| Cart Stack | `U-123` | Test cart add/remove and undo behavior |
| HashMap Lookup | `U-123`, `A-01` | Test fast user/admin lookup by ID |

Use these sample IDs when demonstrating data structure behavior such as CartStack undo operations and HashMap-based lookups.

---

## Backend API Quick Check

After starting the backend, the following endpoints can be opened in a browser to confirm that data is loaded:

```text
http://localhost:8080/api/live/users
http://localhost:8080/api/live/restaurants
http://localhost:8080/api/menu
```

If data appears, the backend is running correctly.

---

## Correct Running Order

Always run the system in this order:

```text
1. Start backend first
2. Start frontend second
3. Open frontend in browser
```

---

## Troubleshooting

### If Backend Data Is Empty

Stop the backend with:

```bash
Ctrl + C
```

Then reset the local H2 database:

```cmd
cd backend
ren data data_old_test
mvn spring-boot:run
```

On macOS/Linux, use:

```bash
cd backend
mv data data_old_test
mvn spring-boot:run
```

### If Port 8080 Is Already Used on Windows

Check Java processes:

```cmd
tasklist | findstr java
```

Stop the backend Java process:

```cmd
taskkill /PID <PID_NUMBER> /F
```

Then start the backend again:

```cmd
mvn spring-boot:run
```

---

## Build Check Before Submission

Backend:

```bash
cd backend
mvn clean install
```

Frontend:

```bash
cd frontend
npm run build
```

Both builds should pass before final submission.

---

## Notes

The database data is created automatically by `DataSeeder.java` when the backend runs.

Generated or local folders should not be committed:

```text
backend/data/
backend/target/
frontend/dist/
node_modules/
```
