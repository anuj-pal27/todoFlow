# TaskFlow Logic Document

## Smart Assign: How It Works

**Goal:** Automatically assign unassigned tasks to the user with the lightest workload, ensuring fair distribution and preventing overload.

**How It Works:**
- When a user clicks the "Smart Assign" button for an unassigned task, the system:
  1. **Fetches all users** in the system.
  2. **Counts each user’s active tasks** (tasks not marked as "Done").
  3. **Finds the user with the fewest active tasks.**
  4. **Assigns the task** to that user.
  5. **Logs the assignment** in the activity log and broadcasts the update in real time to all connected users.

**Example:**
- Alice has 2 active tasks, Bob has 1, and Carol has 3.
- A new unassigned task is smart-assigned.
- The system assigns it to Bob (since he has the fewest active tasks).
- All users see the update instantly, and the activity log records the assignment.

---

## Conflict Handling: How It Works

**Goal:** Prevent accidental overwrites when multiple users edit the same task at the same time, ensuring no data is lost and users can resolve conflicts easily.

**How It Works:**
- Each task has a `version` number that increases with every update.
- When a user edits a task, their form includes the version they started editing.
- When they try to save changes:
  - The backend checks if the version matches the latest version in the database.
  - **If it matches:** The update succeeds.
  - **If it does not match (someone else updated the task):**
    - The backend returns a `409 Conflict` response, including the latest version of the task.
    - The frontend shows a conflict dialog, displaying both the user’s version and the latest version.
    - The user can choose to:
      - **Merge:** Load the latest version into the form and edit again.
      - **Overwrite:** Force their changes, replacing the latest version.
      - **Cancel:** Discard their changes.

**Example:**
- Alice and Bob both open Task X to edit.
- Alice changes the title and saves first. The version increases to 2.
- Bob tries to save his changes (still on version 1). The backend detects the conflict and returns the latest version.
- Bob sees a dialog showing both his changes and Alice’s. He can merge, overwrite, or cancel.

---

**Summary:**
- **Smart Assign** ensures tasks are distributed fairly and efficiently.
- **Conflict Handling** protects against data loss and makes collaboration safe, even with multiple users editing at once. 