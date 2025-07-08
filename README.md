# TaskFlow

A modern, real-time Kanban task management app with collaborative features, smart assignment, and robust conflict handling.

---

## 🚀 Project Overview
TaskFlow is a full-stack Kanban board application designed for teams to manage tasks efficiently. It features real-time updates, an activity log, smart task assignment, and advanced conflict handling for collaborative editing.

---

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- WebSocket (ws)
- JWT Authentication

**Frontend:**
- React
- React Router
- Redux (if used)
- @hello-pangea/dnd (Drag & Drop)
- Axios
- React Toastify
- React Icons

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/anuj-pal27/todoFlow.git
cd todoflow
```

### 2. Backend Setup
```bash
cd todoflow_backend
cp .env.example .env # Create your .env file (see below)
npm install
node index.js
```

**.env file example:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/todoflow
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Setup
```bash
cd ../todoflow_frontend
npm install
npm start or npm run start
```

- The frontend will run on [http://localhost:3000](http://localhost:3000)
- The backend will run on [http://localhost:5000](http://localhost:5000)

---

## ✨ Features
- **User Authentication:** Sign up, log in, and secure JWT-based sessions.
- **Kanban Dashboard:** Drag-and-drop tasks across columns (To Do, In Progress, Done).
- **Task CRUD:** Create, edit, delete, and view tasks with priority and assignee.
- **Smart Assign:** Automatically assign tasks to the user with the lightest workload.
- **Real-Time Updates:** All users see task and activity log changes instantly via WebSocket.
- **Activity Log Sidebar:** See a live feed of all actions (create, update, delete, assign).
- **Conflict Handling:** Prevents accidental overwrites when multiple users edit the same task.
- **Responsive UI:** Modern, mobile-friendly design.

---

## 📝 Usage Guide
1. **Sign Up / Log In:**
   - Register a new account or log in with existing credentials.
2. **Dashboard:**
   - View all tasks in Kanban columns.
   - Drag and drop tasks to change status.
   - Click a task to view or edit details.
3. **Create Task:**
   - Use the "+" button to add a new task.
   - Fill in title, description, priority, and (optionally) assignee.
4. **Edit Task:**
   - Click a task card, then "Edit".
   - Make changes and save. If another user has updated the task, you’ll see a conflict dialog to merge or overwrite changes.
5. **Smart Assign:**
   - Use the "Smart Assign" button to auto-assign a task to the user with the fewest active (not Done) tasks.
6. **Activity Log:**
   - The sidebar shows a real-time feed of all actions, with user, action type, and details.

---

## 🤖 Smart Assign Logic
- When "Smart Assign" is triggered, the backend:
  1. Fetches all users.
  2. Counts each user’s active (not Done) tasks.
  3. Assigns the task to the user with the fewest active tasks.
  4. Logs the assignment in the activity log and broadcasts the update in real time.

---

## ⚔️ Conflict Handling Logic
- Each task has a `version` field.
- When editing, the frontend sends the current version.
- If the backend detects the version has changed (another user updated the task), it returns a 409 Conflict with the latest data.
- The frontend shows a dialog to let the user merge their changes or overwrite with the latest version, preventing accidental data loss.

---

## 🌐 Live App
[Deployed App](#) <!-- Replace # with your live app URL -->

## 🎥 Demo Video
[Watch Demo](#) <!-- Replace # with your demo video link -->

---

## 📄 License
MIT 