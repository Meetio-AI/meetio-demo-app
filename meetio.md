
### Core Architecture
The solution requires a collapsible "Dev Tools" side panel synchronized with the video player. It contains four primary tabs: **Console**, **Network**, **System Info**, and **E2E Helper**.

### 1. Console Tab
A log view aggregating browser events and user actions.
*   **Data Display:** List view containing a timestamp (relative to video start), event type icon, and message text.
*   **Filters:** Top-bar toggle buttons (chips) to filter the feed. Multiple filters can be active simultaneously:
    *   *All, Step, Click, Log, Warning, Error, Network Error.*
    *   *Note:* "Step" captures lifecycle events (e.g., "Session Started"). "Click" captures user interactions with specific DOM elements.
*   **Interactive Sync:** Clicking any row in the console instantly seeks the video player to that timestamp.
*   **Visuals:** Color-coded rows based on log level (e.g., red for errors, yellow for warnings).

### 2. Network Tab
A request monitor similar to Chrome DevTools.
*   **Search/Filter:** Text input field supporting Regex.
    *   **Invert Feature:** A checkbox/toggle to hide results matching the search term (exclusion filter).
*   **Category Filters:** Toggles for *All, JS, Fetch/XHR, Images, WS (WebSockets).*
*   **Quick Filters:** "Errors only" and "3rd-party requests" checkboxes.
*   **Table Columns:**
    *   Default: Start Time, Name, Status, Method.
    *   Customizable: Context menu to toggle visibility of additional columns (Path, Protocol, Domain, Initiator).
*   **Request Details:** Clicking a row opens a sub-panel showing full request/response headers and payloads.

### 3. System Info Tab
Read-only display of the user's environment variables at the time of recording.
*   **Fields:** Platform (OS), Network type, Engine, Screen Resolution, Viewport Size, Vendor, Timezone, and User Agent string.

### 4. E2E Helper Tab (Test Generator)
Automatically generates reproduction scripts based on the session events.
*   **Framework Selector:** Dropdown to switch syntax between *Playwright, Cypress, Puppeteer,* and *Selenium*.
*   **Code View:** Read-only text area with syntax highlighting displaying the generated test code.
*   **Action:** Copy to clipboard button.

### 5. global Interactions & Settings
*   **Bi-Directional Sync:**
    *   *Log to Video:* Clicking an entry in Console/Network jumps video to that time.
    *   *Video to Log:* As the video plays, the Console/Network lists must auto-scroll to keep the current events in view.
*   **Settings Menu:**
    *   "Wrap text" (toggle).
    *   "Auto-scroll with playback" (toggle).