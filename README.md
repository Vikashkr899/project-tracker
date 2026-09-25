# Mini Project Delivery Tracker

An internal tracker for organizing projects, assigning tasks, reporting blockers, and reviewing delivery status.

**Stack:** React (Vite) frontend · Node.js/Express backend · **MySQL** (via Sequelize)

---

## 1. Prerequisites

- Node.js 18+ and npm
- MySQL 8+ running locally (or accessible remotely)
- VS Code (or any editor) — recommended extensions: *ES7+ React/Redux snippets*, *MySQL* (by Weijan Chen or similar), *REST Client* or *Thunder Client* for hitting the API directly

## 2. Database setup

Create the database (the app will create tables itself on first boot, but the database itself must exist):

```sql
CREATE DATABASE project_tracker;
CREATE DATABASE project_tracker_test;   -- only needed if you'll run the test suite
```

You can do this from the `mysql` CLI, MySQL Workbench, or a VS Code MySQL extension. A `backend/schema.sql` file is also included if you'd rather create tables explicitly instead of relying on `sequelize.sync()`.

## 3. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set DB_USER / DB_PASSWORD to match your local MySQL

npm install
npm run seed     # creates tables and inserts sample users/projects/tasks
npm run dev       # starts the API on http://localhost:4000
```

Verify it's up: open http://localhost:4000/health — should return `{"ok": true}`.

## 4. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev        # starts Vite on http://localhost:5173
```

Open http://localhost:5173 — the Vite dev server proxies `/api/*` to the backend on port 4000 (see `vite.config.js`), so no extra env config is needed for local dev.

## 5. Running tests

```bash
cd backend
npm test
```

Tests run against the `project_tracker_test` database (set via `TEST_DB_NAME` in `.env`) and wipe/recreate its tables on each run (`sequelize.sync({ force: true })`) — do not point `TEST_DB_NAME` at a database you care about.

**What's covered (10 tests across 3 files):**
- `tests/project.test.js` — project creation, validation (missing name, invalid status), task completion-percentage calculation
- `tests/task.test.js` — status change, invalid status rejection, **concurrent edit conflict (409)**
- `tests/blocker.test.js` — blocker validation (reason/reporter required), blocker fields set correctly, blocker fields cleared on unblock

### Manual testing checklist

- [ ] Create a project, confirm it appears in the Projects list and Dashboard
- [ ] Edit a project's status and confirm the badge updates everywhere
- [ ] Create a task inside a project with an assignee, deadline, and priority
- [ ] Move a task through To Do → In Progress → Done, confirm the project's completion % updates
- [ ] Mark a task Blocked without filling in the blocker modal — confirm it's rejected
- [ ] Mark a task Blocked with a reason + reporter — confirm it shows in the project view with a timestamp
- [ ] Move a Blocked task to another status — confirm blocker info clears
- [ ] Open the same task in two browser tabs, change its status in tab A, then try to save an edit in tab B — confirm tab B gets a conflict message instead of silently overwriting
- [ ] Filter tasks by status, by assignee, and search by title
- [ ] Filter projects by status and search by name
- [ ] Open "activity history" on a project and confirm status changes are logged with actor + timestamp
- [ ] Restart the backend and confirm all data is still there (persistence)

## 6. Completion percentage definition

`completionPercentage = round((tasks with status "Done" / total tasks) * 100)`. A project with zero tasks reports 0%.

## 7. Concurrency (avoiding silent overwrites)

Every `Project` and `Task` has an integer `version` column. Any update request can include the `version` the client last read; if it doesn't match the current row, the server returns **409 Conflict** with the current record instead of applying the write. The frontend catches this, alerts the user, and reloads the latest data. See `PLAN.md` for the tradeoffs of this approach vs. alternatives.

## 8. Project structure

```
backend/
  src/
    config/database.js     Sequelize + MySQL connection
    models/                 User, Project, Task, ActivityLog + associations
    controllers/             business logic per resource
    routes/                   Express routers
    middleware/               validation + centralized error handling
    app.js / server.js       Express app wiring / boot
    seed.js                   sample data
  schema.sql                 reference DDL
  tests/                      Jest + Supertest

frontend/
  src/
    api/client.js             fetch wrapper for the backend API
    pages/                     Dashboard, Projects, ProjectDetail
    components/                ProjectModal, TaskModal, BlockerModal, TaskCard
    App.jsx / main.jsx
```

## 9. API summary

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/dashboard` | project/task counts |
| GET | `/api/projects` | list (filters: `status`, `search`) |
| GET | `/api/projects/:id` | project + tasks + stats |
| POST | `/api/projects` | create |
| PATCH | `/api/projects/:id` | update (optimistic-locked via `version`) |
| DELETE | `/api/projects/:id` | delete |
| GET | `/api/projects/:id/tasks` | list tasks in a project |
| POST | `/api/projects/:id/tasks` | create task in a project |
| GET | `/api/tasks` | list (filters: `projectId`, `status`, `assigneeId`, `search`) |
| PATCH | `/api/tasks/:id` | update fields (optimistic-locked) |
| PATCH | `/api/tasks/:id/status` | change status; requires `blockerReason`/`blockerReportedBy` when setting `Blocked` |
| DELETE | `/api/tasks/:id` | delete |
| GET/POST | `/api/users` | list/create users (seed data provides a few) |
| GET | `/api/activity` | activity log (filters: `projectId`, `taskId`) |

See `PLAN.md` for design rationale and known limitations.
