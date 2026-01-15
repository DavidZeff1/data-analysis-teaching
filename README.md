# Data Analysis Teaching Website

A simple web application for teaching data analysis concepts (SQL, Python, Excel, etc.), built with vanilla JavaScript and TailwindCSS.

## How It Works

- **`index.html`**: The shell of the application. It contains the navigation tabs and empty "container" divs where content is dynamically loaded.
- **`main.js`**: The brain of the application. It watches for clicks on the request tabs and fetches the corresponding HTML files from the `public` folder to display them.
- **`public/`**: Stores the actual content files (e.g., `python/seaborn.html`, `sql/basics.html`).

## How to Add New Content

Follow these 3 steps to add a new page (e.g., adding a "Basics" page to the Python section):

### 1. Update `index.html`
First, add the navigation button and the container where the content will live.

**Add the button:**
```html
<!-- Inside the relevant content div -->
<button class="subtab ..." data-tab="python" data-sub="basics">
  Basics
</button>
```

**Add the container:**
The ID MUST be in the format `[tab]-[sub]` (e.g., `python-basics`).
```html
<div id="python-basics" class="subcontent hidden">Loading...</div>
```

### 2. Create the Content File
Create a new HTML file in the `public` folder (e.g., `public/python/basics.html`). This file should contain just the HTML content (no `<html>` or `<body>` tags needed, just the content).

### 3. Update `main.js`
Tell JavaScript where to find your new file. Add it to the `content` object:

```javascript
/* main.js */
const content = {
  python: {
    // ... existing items
    basics: () => fetch('/python/basics.html').then(r => r.text()),
  }
}
```

## Running the Project

1.  **Install dependencies** (first time only):
    ```bash
    npm install
    ```

2.  **Start the server**:
    ```bash
    npm run dev
    ```
    This will give you a local URL (usually `http://localhost:5173`) to view the site.
