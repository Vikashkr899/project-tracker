# PLAN.md

## Interpretation of the task

Build an internal tracker where a team can:
- Create/edit **projects** (name, description, deadline, status) and see task counts + completion % per project.
- Create/edit **tasks** inside a project (title, description, assignee, deadline, priority, status).
- Report **blockers** on a task (reason, reporter, timestamp required) and see them clearly in the project view.
- See a persistent **activity history** of task/project changes (actor, time, what changed, previous/new status).
- See a **dashboard** (project/task counts) and **filter/search** tasks by project, status, assignee, and title.
- Handle **concurrent edits** without silent overwrites.

Stack chosen: **React (Vite)** frontend, **Node.js/Express** backend, **MySQL** (via Sequelize) for persistence — all stacks I'm comfortable moving quickly and correctly in.

## Database entities

- **User** — id, name, email
- **Project** — id, name, description, deadline, status (enum), version (for optimistic locking)
- **Task** — id, projectId (FK), title, description, assigneeId (FK → User, nullable), deadline, priority (enum), status (enum), blockerReason, blockerReportedBy, blockerReportedAt, version
- **ActivityLog** — id, projectId (FK), taskId (FK, nullable), actor, action, previousStatus, newStatus, details, createdAt

Relationships: Project 1—N Task; User 1—N Task (assignee); Project/Task 1—N ActivityLog.

## API structure

- `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id`
- `GET/POST /api/projects/:id/tasks` (nested create/list)
- `GET/PATCH/DELETE /api/tasks/:id`, `PATCH /api/tasks/:id/status` (dedicated status-change + blocker endpoint)
- `GET/POST /api/users`
- `GET /api/activity?projectId=&taskId=`
- `GET /api/dashboard`

All list endpoints accept query params for filtering (`status`, `projectId`, `assigneeId`, `search`).

## Concurrency approach

Every `Project` and `Task` row has an integer `version` column. The frontend always sends back the `version` it last read when updating a task/project. If the server's current version doesn't match, it returns **409 Conflict** with the current record instead of overwriting — the client reloads and the user retries. This is a lightweight optimistic-locking pattern; it was chosen over pessimistic locks/row locking because this is a low-contention internal tool where blocking writers isn't worth the complexity, and over a full CRDT/merge approach because the fields here (status, assignment) don't merge meaningfully — one write should simply win and the loser should be told, not silently discarded.

## Estimated work breakdown (2 days)

1. Backend models, migrations/sync, and DB schema — ~2.5h
2. Backend CRUD + status/blocker endpoints + validation + concurrency check — ~3.5h
3. Backend tests (Jest/Supertest) — ~1.5h
4. Frontend scaffold, API client, Dashboard + Projects list — ~2h
5. Frontend Project detail (tasks, filters, blocker/status flows) — ~3h
6. Activity history view, polish, README/setup verification — ~1.5h

## Development sequence

Backend data model → backend API + validation → backend tests → frontend read views (dashboard/projects) → frontend write flows (create/edit/status/blocker) → activity history → polish/docs.

## Risks

- **MySQL setup friction on a fresh machine** — mitigated with a `schema.sql` reference file and `sequelize.sync()` auto-create on boot, plus a seed script.
- **Concurrency edge cases** — optimistic locking covers the common "two people edit the same task" case; it does not cover partial-field merges (e.g. one person edits the title while another changes status) — documented as a known tradeoff.
- **Time to build a full auth system** — explicitly out of scope per the assessment; used a free-text "actor" field for who performed an action instead.

---

## Progress update (end of assignment)

**Completed:**
- Full backend: models, associations, CRUD + status/blocker endpoints, input validation, optimistic-locking concurrency check, activity logging on every mutation, dashboard aggregation endpoint, seed script, reference `schema.sql`.
- Full frontend: Dashboard, Projects list (search + status filter), Project detail (task list, filters by status/assignee/search, task/project create & edit modals, status-change dropdown, blocker-reporting modal, activity history toggle).
- Backend tests: project creation + validation, task status changes, concurrency conflict (409), blocker validation and field-clearing — 10 tests total across 3 files, covering more than the required 3 scenarios.
- README with fresh-machine setup steps, env vars, and a manual testing checklist.

**What remains / would improve with one more day:**
- Add frontend automated tests (React Testing Library) — currently only manual + backend tests.
- Replace `sequelize.sync()` with proper migrations (`sequelize-cli`) for safer schema evolution.
- Add pagination to task/project lists and activity history (currently unbounded/simple `LIMIT`).
- Field-level (not just whole-record) conflict resolution, so editing different fields concurrently doesn't need a full reject-and-reload.
- A small dedicated "My Tasks" view filtered by assignee across all projects.

**Problems encountered:** None blocking — the main design decision was how to handle concurrent edits without introducing real-time infrastructure (WebSockets); optimistic locking via a `version` column was the simplest correct solution for this scope.
