# TaskForge API

A RESTful backend API for managing users, projects, and tasks.

TaskForge API is built as an internship project to demonstrate REST API development, database integration, validation, filtering, statistics, and API testing.

## 🚀 Features

- User management
- Project management
- Task management
- Task filtering by status
- Task filtering by priority
- Task filtering by project
- Task statistics
- CRUD operations
- Input validation
- Error handling
- Supabase PostgreSQL database
- Postman API testing
- Environment variable configuration
- Persistent PostgreSQL database using Supabase
- Soft delete and task restoration
- Task search, filtering, and pagination
- Task history and audit trail
- Automatic tracking of task status and priority changes
- Bulk task status updates
- Bulk soft delete operations
- Restore deleted tasks with history tracking
- Database indexes for improved query performance

## 📋 Task History & Audit Trail

TaskForge maintains a complete history of important task actions.

Tracked events include:

- Task creation
- Status changes
- Priority changes
- Task deletion
- Task restoration

Example:

Created
↓
Status: pending → completed
↓
Priority: medium → high
↓
Deleted
↓
Restored

## ⚡ Advanced Task Management

TaskForge supports advanced task management operations including:

- Search tasks by title
- Filter by status, priority, and project
- Pagination
- Bulk status updates
- Bulk soft deletion
- Task restoration
- Task statistics
- Task audit history

## 🛠️ Tech Stack

- Node.js
- Express.js
- TypeScript
- Supabase
- PostgreSQL
- Postman
- dotenv
- CORS

## 📁 Project Structure

```text
TaskForge-API/
│
├── src/
│   ├── routes/
│   │   ├── users.ts
│   │   ├── projects.ts
│   │   └── tasks.ts
│   │
│   ├── server.ts
│   └── supabase.ts
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md


## ⚙️ Installation

### 1. Install dependencies

Open the terminal inside the TaskForge-API folder and run:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the main TaskForge-API folder.

Add:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
PORT=5000
```

⚠️ Never share or upload your actual Supabase credentials.

### 3. Run the Project

Start the server:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:5000
```

To check if the server is running, open:

```text
http://localhost:5000/
```

You should see:

```json
{
  "success": true,
  "message": "TaskForge API is running 🚀"
}
```

## 🔗 API Endpoints

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create a user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get project by ID |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tasks/stats` | Get task statistics |

### Task Filtering

```text
GET /api/tasks?status=pending
GET /api/tasks?priority=high
GET /api/tasks?project_id=PROJECT_ID
```

Multiple filters can also be combined:

```text
GET /api/tasks?status=pending&priority=high
```

## 📊 Task Statistics

The Task Statistics API provides a summary of the tasks in the database.

Endpoint:

```text
GET /api/tasks/stats
```

It returns:

- Total number of tasks
- Number of pending tasks
- Number of completed tasks
- Number of high-priority tasks

Example response:

```json
{
  "success": true,
  "statistics": {
    "total": 12,
    "pending": 6,
    "completed": 6,
    "high_priority": 1
  }
}
```

## 🛡️ Validation & Error Handling

The API validates incoming data before processing requests.

### Task Validation

The following fields are required when creating a task:

- `user_id`
- `project_id`
- `title`

### Status Validation

Allowed task statuses:

```text
pending
completed
```

### Priority Validation

Allowed task priorities:

```text
low
medium
high
```

Invalid input returns a `400 Bad Request` response with an appropriate error message.

Example:

```json
{
  "success": false,
  "error": "Priority must be low, medium or high"
}
```

The API also returns appropriate error responses when database operations fail or requested records are not found.

## 🧪 API Testing

The TaskForge API was tested using Postman.

The following operations were tested successfully:

### Users
- Create User
- Get All Users

### Projects
- Create Project
- Get All Projects
- Get Project by ID
- Update Project
- Delete Project

### Tasks
- Create Task
- Get All Tasks
- Get Task by ID
- Update Task
- Delete Task
- Filter Tasks by Status
- Filter Tasks by Priority
- Filter Tasks by Project
- Task Statistics

### Validation Testing
- Empty task title
- Invalid task priority
- Invalid task status

Postman was used to verify successful responses, error responses, CRUD operations, filtering, and statistics.

## 🚀 Deployment

The TaskForge API can be deployed using Vercel.

Before deployment, configure the following environment variables in the hosting platform:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `PORT`

The `.env` file should never be uploaded to the GitHub repository.

After deployment, the API can be accessed using the deployed API URL.

## 🎯 Project Objective

The objective of TaskForge API is to build a structured backend system for managing users, projects, and tasks.

The project demonstrates:

- REST API development
- CRUD operations
- PostgreSQL database integration
- User, project, and task relationships
- Input validation
- Task filtering
- Task statistics
- API testing using Postman
- Environment variable configuration
- Backend deployment

## 👨‍💻 Author

Developed as part of an internship project.