# UM-Dabau Smart Food Delivery System

Simple setup guide for running the project after cloning the repo.

---

## 1. Clone the Repository

Open CMD and run:

```cmd
git clone https://github.com/JunBin05/UM-Dabau-Food-Delivery-System.git
cd UM-Dabau-Food-Delivery-System
```

---

## 2. Requirements

Make sure these are installed:

```cmd
java -version
mvn -version
node -v
npm -v
```

You need:

* Java JDK 17 or above
* Maven
* Node.js and npm

---

## 3. Run Backend

Open CMD in the project folder:

```cmd
cd backend
mvn clean install
mvn spring-boot:run
```

Wait until the backend starts on:

```text
http://localhost:8080
```

Do not close this CMD window.

---

## 4. Check Backend Data

Open these links in browser:

```text
http://localhost:8080/api/live/users
http://localhost:8080/api/live/restaurants
http://localhost:8080/api/menu
```

If data appears, backend is working.

---

## 5. Run Frontend

Open another CMD window.

Go to the project folder:

```cmd
cd UM-Dabau-Food-Delivery-System
cd frontend
npm install
npm run dev
```

Open the frontend link shown in CMD, usually:

```text
http://localhost:5173
```

---

## 6. Correct Running Order

Always run in this order:

```text
1. Start backend first
2. Start frontend second
3. Open frontend in browser
```

---

## 7. If Data Is Empty

Stop the backend first using:

```cmd
Ctrl + C
```

Then reset the local H2 database:

```cmd
cd backend
ren data data_old_test
mvn spring-boot:run
```

After that, check again:

```text
http://localhost:8080/api/live/users
http://localhost:8080/api/live/restaurants
http://localhost:8080/api/menu
```

---

## 8. If Port 8080 Is Already Used

Check Java processes:

```cmd
tasklist | findstr java
```

Stop the backend Java process:

```cmd
taskkill /PID <PID_NUMBER> /F
```

Then run backend again:

```cmd
mvn spring-boot:run
```

---

## 9. Build Check

Backend:

```cmd
cd backend
mvn clean install
```

Frontend:

```cmd
cd frontend
npm run build
```

Both should pass before submission.

---

## 10. Notes

Do not commit these generated/local folders:

```text
backend/data/
backend/target/
frontend/dist/
node_modules/
```

The database data is created automatically by `DataSeeder.java` when the backend runs.
