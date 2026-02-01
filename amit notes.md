# Amit's Complete Guide - Interactive-Q Project

## 📱 What is This Project?

**Interactive-Q** is a **Real-Time Q&A and Polling Platform** - like an interactive classroom or meeting room where people can:
- 👥 **Create or join chat rooms**
- 💬 **Send messages in real-time**
- 📊 **Create and participate in polls**
- 👍 **Like/unlike messages**
- 🗳️ **Vote on poll options**
- 👑 **Manage room members** (admin features)
- 🔐 **Secure authentication** with JWT tokens

**Think of it as**: A combination of Slack + Poll Everywhere + Discord for Q&A sessions

---

## 🏗️ Project Architecture

This project uses **Microservices Architecture** with 4 main components:

### **1. Java Spring Boot Backend** (Port 8081)
- **Technology**: Java 17 + Spring Boot 3.1.5
- **Purpose**: Main REST API for business logic
- **Features**:
  - User authentication (signup/login)
  - JWT token generation and validation
  - Room management (create/join/leave)
  - Message and poll CRUD operations
  - Like/vote functionality
  - Database operations
- **Database**: MySQL 8.0
- **File Location**: `Backend/main/`

### **2. Node.js WebSocket Backend** (Port 3000)
- **Technology**: Node.js + Socket.IO
- **Purpose**: Real-time communication
- **Features**:
  - Live message broadcasting
  - Real-time poll updates
  - Instant like notifications
  - Member join/leave events
  - Room admin actions (rename, end room)
- **File Location**: `Backend/NodeJsBackend/`

### **3. React Frontend** (Port 5173)
- **Technology**: React + Vite + Tailwind CSS
- **Purpose**: User interface
- **Features**:
  - Sign up / Sign in pages
  - Room creation and joining
  - Chat interface
  - Poll creation and voting
  - Member management sidebar
- **File Location**: `Frontend/frontend/`

### **4. MySQL Database** (Port 3306)
- **Technology**: MySQL 8.0
- **Purpose**: Data persistence
- **Stores**:
  - Users (Person)
  - Rooms
  - Messages
  - Poll options
  - Votes
  - Likes
- **Database Name**: `test_temp`
- **Root Password**: `Aniket`

---

## 🐳 Understanding Docker

### **What is Docker?**
Docker is like a **virtual shipping container** for software:
- Packages your app + all dependencies together
- Runs the same way on any computer
- Isolates apps from each other
- Makes deployment easy

### **Key Docker Concepts**

1. **Image** 📦
   - A blueprint/template (like a recipe)
   - Contains code, runtime, libraries, tools
   - Example: `mysql:8.0`, `node:18-alpine`

2. **Container** 🚢
   - A running instance of an image (like cooking from the recipe)
   - Can be started, stopped, deleted
   - Example: `interactive-q-mysql`, `interactive-q-java-backend`

3. **Dockerfile** 📝
   - Instructions to build an image
   - Like a recipe card
   - Each service has its own Dockerfile

4. **Docker Compose** 🎼
   - Orchestrates multiple containers
   - Defined in `docker-compose.yml`
   - Starts all services with one command

### **How Docker Works in This Project**

```
┌─────────────────────────────────────────────────┐
│           docker-compose.yml                    │
│  (Orchestrator - Controls Everything)           │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬──────────┐
        │             │             │          │
   ┌────▼───┐   ┌────▼───┐   ┌─────▼────┐  ┌─▼──────┐
   │ MySQL  │   │  Java  │   │ Node.js  │  │Frontend│
   │  :3306 │   │  :8081 │   │  :3000   │  │ :5173  │
   └────────┘   └────────┘   └──────────┘  └────────┘
```

---

## 🚀 Complete Startup Guide (After Laptop Restart)

### **Step 1: Start Docker Desktop**

**Option A - Using Start Menu:**
1. Click Windows Start button
2. Search for "Docker Desktop"
3. Click to open
4. Wait for Docker icon in system tray to be stable (not spinning)

**Option B - Using Command:**
```powershell
# Run in PowerShell as Administrator
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

⏳ **Wait 30-60 seconds** for Docker to fully initialize

---

### **Step 2: Verify Docker is Running**

Open Terminal in VS Code (`` Ctrl+` ``) and run:

```powershell
docker --version
```
✅ Should show: `Docker version 20.x.x...`

```powershell
docker ps
```
✅ Should show a table (even if empty)

---

### **Step 3: Navigate to Project Folder**

```powershell
cd c:\Users\aamit\OneDrive\Desktop\JAVA\PROJECT\Interactive-Q
```

---

### **Step 4: Start All Containers**

```powershell
docker-compose up -d
```

**What happens:**
- 📥 Downloads/builds images (first time only)
- 🚀 Starts 4 containers in background
- ⏱️ Takes 2-3 minutes first time, 30 seconds later

**Command breakdown:**
- `docker-compose` = Use the compose file
- `up` = Start containers
- `-d` = Detached mode (runs in background)

---

### **Step 5: Check Container Status**

```powershell
docker-compose ps
```

✅ **All 4 should show "Up":**
- `interactive-q-mysql` → Up (healthy)
- `interactive-q-java-backend` → Up
- `interactive-q-nodejs-backend` → Up
- `interactive-q-frontend` → Up

---

### **Step 6: Access Your Application**

**Frontend (Main App):**
```
http://localhost:5173
```

**Java API Documentation:**
```
http://localhost:8081/swagger-ui/index.html
```

**Backend Services:**
- Java API: `http://localhost:8081`
- Node.js WebSocket: `http://localhost:3000`
- MySQL Database: `localhost:3306`

---

## 🛠️ Essential Docker Commands

### **Starting & Stopping**

```powershell
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# Stop and remove all data (⚠️ deletes database!)
docker-compose down -v

# Restart specific service
docker-compose restart java-backend
docker-compose restart mysql-db
```

---

### **Viewing Logs (Debugging)**

```powershell
# View all logs
docker-compose logs

# Follow logs in real-time (like tail -f)
docker-compose logs -f

# View logs from specific service
docker-compose logs java-backend
docker-compose logs nodejs-backend
docker-compose logs mysql-db
docker-compose logs frontend

# Show only last 50 lines
docker-compose logs --tail=50 java-backend

# Follow specific service logs
docker-compose logs -f java-backend
```

---

### **Rebuilding After Code Changes**

```powershell
# Rebuild and restart all services
docker-compose up --build -d

# Rebuild only specific service
docker-compose up --build -d java-backend

# Force complete rebuild (if having issues)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

### **Checking Status**

```powershell
# List running containers
docker-compose ps
docker ps

# Check resource usage (CPU, Memory)
docker stats

# View detailed container info
docker inspect interactive-q-mysql

# Check container health
docker inspect interactive-q-mysql | findstr "Health"
```

---

### **Accessing Container Shell**

```powershell
# Access MySQL database directly
docker exec -it interactive-q-mysql mysql -uroot -pAniket test_temp

# Access Java backend container
docker exec -it interactive-q-java-backend sh

# Access Node.js backend container
docker exec -it interactive-q-nodejs-backend sh

# Access frontend container
docker exec -it interactive-q-frontend sh
```

---

### **Database Operations**

```powershell
# Connect to MySQL
docker exec -it interactive-q-mysql mysql -uroot -pAniket test_temp

# Show all databases
docker exec -it interactive-q-mysql mysql -uroot -pAniket -e "SHOW DATABASES;"

# Export database backup
docker exec interactive-q-mysql mysqldump -uroot -pAniket test_temp > backup.sql

# Import database
Get-Content backup.sql | docker exec -i interactive-q-mysql mysql -uroot -pAniket test_temp
```

---

## 📂 Project File Structure Explained

```
Interactive-Q/
│
├── docker-compose.yml          # Main orchestration file - starts all services
│
├── Backend/
│   ├── main/                   # Java Spring Boot Backend
│   │   ├── Dockerfile          # Instructions to build Java image
│   │   ├── pom.xml            # Java dependencies (like package.json)
│   │   └── src/
│   │       ├── main/java/
│   │       │   └── com/InteractiveQ/main/
│   │       │       ├── MainApplication.java     # Entry point
│   │       │       ├── controller/              # REST API endpoints
│   │       │       ├── entities/                # Database models
│   │       │       ├── service/                 # Business logic
│   │       │       └── repository/              # Database queries
│   │       └── resources/
│   │           └── application.properties       # Configuration
│   │
│   └── NodeJsBackend/          # Node.js WebSocket Backend
│       ├── Dockerfile          # Instructions to build Node image
│       ├── package.json        # Node dependencies
│       └── server.js           # WebSocket server code
│
├── Frontend/frontend/          # React Frontend
│   ├── Dockerfile             # Instructions to build frontend image
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   └── src/
│       ├── config.js          # API and WebSocket URLs
│       ├── Pages/             # All page components
│       └── components/        # Reusable components
│
└── DataBase/
    └── Queries.sql            # Initial database setup (optional)
```

---

## 🔧 Configuration Files

### **1. docker-compose.yml**
- Defines all 4 services
- Sets ports, environment variables
- Creates network between containers
- Manages data persistence

### **2. application.properties** (Java Backend)
```properties
server.port=8081
spring.datasource.url=jdbc:mysql://mysql-db:3306/test_temp
spring.datasource.username=root
spring.datasource.password=Aniket
```

### **3. config.js** (Frontend)
```javascript
export const API_BASE = `http://localhost:8081`;
export const SOCKET_URL = `http://localhost:3000`;
```

---

## 🎯 Your Daily Development Workflow

### **Morning Routine (After Starting Laptop):**

1. ✅ Open Docker Desktop → Wait until running
2. ✅ Open VS Code in project folder
3. ✅ Open Terminal (Ctrl + `)
4. ✅ Run: `docker-compose up -d`
5. ✅ Wait 30 seconds
6. ✅ Open browser: `http://localhost:5173`

---

### **Making Code Changes:**

**Frontend Changes:**
```powershell
# 1. Edit files in Frontend/frontend/src/
# 2. Rebuild frontend
docker-compose up --build -d frontend
# 3. Refresh browser
```

**Java Backend Changes:**
```powershell
# 1. Edit files in Backend/main/src/
# 2. Rebuild backend
docker-compose up --build -d java-backend
# 3. Check logs
docker-compose logs -f java-backend
```

**Node.js Backend Changes:**
```powershell
# 1. Edit Backend/NodeJsBackend/server.js
# 2. Rebuild
docker-compose up --build -d nodejs-backend
# 3. Check logs
docker-compose logs -f nodejs-backend
```

---

### **Evening Routine (Before Shutting Down):**

**Option 1: Keep containers running**
```powershell
# Containers will pause when laptop sleeps
# Auto-resume when you wake laptop
# (Uses minimal resources)
```

**Option 2: Stop containers**
```powershell
docker-compose down
# Stops containers, keeps data
# Faster startup next time
```

**Option 3: Clean everything**
```powershell
docker-compose down -v
# ⚠️ Deletes all data including database!
# Fresh start next time
```

---

## 🐛 Troubleshooting Guide

### **Problem: Docker Desktop won't start**
```powershell
# Solution 1: Restart Docker service
Get-Service *docker* | Restart-Service

# Solution 2: Restart laptop
# Solution 3: Reinstall Docker Desktop
```

---

### **Problem: Port already in use (8081, 3000, 5173)**
```powershell
# Find what's using the port
netstat -ano | findstr :8081

# Kill the process (replace PID with actual number)
Stop-Process -Id <PID> -Force

# Or stop conflicting services
docker-compose down
```

---

### **Problem: Container won't start**
```powershell
# 1. Check logs for errors
docker-compose logs [service-name]

# 2. Remove and recreate
docker-compose down
docker-compose up -d

# 3. Complete reset
docker-compose down -v
docker-compose up --build -d
```

---

### **Problem: MySQL connection refused**
```powershell
# 1. Check if MySQL container is running
docker-compose ps mysql-db

# 2. Check if healthy
docker inspect interactive-q-mysql | findstr Health

# 3. Restart MySQL
docker-compose restart mysql-db

# 4. Wait 30 seconds and try again
```

---

### **Problem: Java backend won't connect to MySQL**
```powershell
# 1. Check Java logs
docker-compose logs java-backend

# 2. Verify MySQL is healthy first
docker-compose ps

# 3. Restart Java backend
docker-compose restart java-backend
```

---

### **Problem: Frontend shows connection error**
```powershell
# 1. Verify backends are running
docker-compose ps

# 2. Check config.js has correct URLs
# Frontend/frontend/src/config.js should have:
# http://localhost:8081 and http://localhost:3000

# 3. Rebuild frontend
docker-compose up --build -d frontend
```

---

### **Problem: Build fails with "no space left on device"**
```powershell
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## 📊 Database Information

**Connection Details:**
- Host: `localhost`
- Port: `3306`
- Database: `test_temp`
- Username: `root`
- Password: `Aniket`

**Tables:**
- `person` - Users
- `room` - Chat rooms
- `message` - Messages and polls
- `poll_option` - Poll choices
- `vote` - User votes on polls
- `like_message` - Message likes
- `belong_to_room` - Room membership

**Access MySQL CLI:**
```powershell
docker exec -it interactive-q-mysql mysql -uroot -pAniket test_temp
```

**Common MySQL Commands:**
```sql
-- Show all tables
SHOW TABLES;

-- View all users
SELECT * FROM person;

-- View all rooms
SELECT * FROM room;

-- Count messages
SELECT COUNT(*) FROM message;

-- Exit MySQL
EXIT;
```

---

## 🔐 API Endpoints

### **Authentication**
```
POST /signup - Register new user
POST /login - Get JWT token
POST /refresh - Refresh token
GET /profile - Get user profile (requires token)
```

### **Rooms**
```
POST /room/create - Create room
POST /room/join - Join room
GET /room/{id} - Get room details
GET /rooms - List all rooms
```

### **Messages**
```
POST /message/send - Send message
POST /message/poll - Create poll
POST /message/vote - Vote on poll
POST /message/like - Like message
GET /room/{id}/messages - Get room messages
```

---

## 📝 Quick Reference Card

### **Most Used Commands:**
```powershell
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build -d

# Check status
docker-compose ps

# Restart service
docker-compose restart java-backend
```

### **URLs to Remember:**
- Frontend: http://localhost:5173
- Java API: http://localhost:8081
- Node.js: http://localhost:3000
- MySQL: localhost:3306

---

## 💡 Pro Tips

1. **Always check logs** when something isn't working:
   ```powershell
   docker-compose logs -f
   ```

2. **Keep Docker Desktop running** in the background - uses minimal resources

3. **Use `--build` flag** whenever you make code changes

4. **Check container health** before debugging:
   ```powershell
   docker-compose ps
   ```

5. **Save this file** - refer to it whenever you need help!

---

## 📚 Learning Resources

**Docker:**
- Docker Official Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/

**Technologies Used:**
- Java Spring Boot: https://spring.io/projects/spring-boot
- React: https://react.dev/
- Socket.IO: https://socket.io/
- MySQL: https://dev.mysql.com/doc/

---

## ✅ Success Checklist

After starting Docker, verify everything is working:

- [ ] Docker Desktop is running (check system tray)
- [ ] All 4 containers show "Up" in `docker-compose ps`
- [ ] Frontend loads at http://localhost:5173
- [ ] No errors in `docker-compose logs`
- [ ] Can sign up / log in on frontend
- [ ] Can create a room

If all checked ✅ → **Everything is working!** 🎉

---

## 📞 Quick Help

**Container won't start?**
→ Check logs: `docker-compose logs [service-name]`

**Port in use?**
→ Stop: `docker-compose down` then `docker-compose up -d`

**Database issues?**
→ Restart: `docker-compose restart mysql-db`

**Frontend not connecting?**
→ Check backends are running: `docker-compose ps`

**Want fresh start?**
→ Complete reset: `docker-compose down -v && docker-compose up -d`

---

**Created by: Amit**  
**Last Updated: January 29, 2026**  
**Project: Interactive-Q - Real-Time Q&A Platform**

---

*Keep this file handy! Bookmark it in VS Code for quick reference.* 📌
