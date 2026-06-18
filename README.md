# ⚡ BigQuery Release Notes Viewer

A sleek, dark-mode web application that fetches and displays the latest **Google BigQuery release notes** from the official Google Cloud Atom feed — with one-click sharing to **X (Twitter)**.

Built with **Python Flask** on the backend and plain **HTML, CSS, and JavaScript** on the frontend. No heavy frameworks, no build steps.

---

## ✨ Features

- **Live feed** — pulls release notes directly from the [Google Cloud BigQuery Atom feed](https://docs.cloud.google.com/feeds/bigquery-release-notes.xml)
- **Refresh button** — manually refresh at any time; animated spinner provides clear loading feedback
- **Skeleton loading** — shimmer placeholder cards shown while fetching, for a polished experience
- **Expandable cards** — click any release note to expand its full HTML content inline
- **Tweet composer** — select any update, click **Tweet this**, edit the pre-filled message, and post directly to X (Twitter) via Twitter Web Intent
- **Character counter** — live `0 / 280` counter with colour-coded warnings and automatic button disable when over limit
- **View on docs** — direct link to the official Google Cloud documentation entry
- **Scroll-to-top** — floating button appears when scrolling, returns to top smoothly
- **Keyboard accessible** — `Enter`/`Space` to expand cards, `Escape` to close the tweet modal
- **Responsive** — adapts cleanly to mobile and tablet viewports

---

## 🚀 Getting Started

### Prerequisites

- Python **3.11+**
- `pip` / `venv`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/braxtonliu/Brax-event-talks-app.git
cd Brax-event-talks-app

# 2. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the development server
python app.py
```

The app will be available at **http://127.0.0.1:5000**.

---

## 📁 Project Structure

```
Brax-event-talks-app/
├── app.py                  # Flask app — feed fetching, XML parsing, API route
├── requirements.txt        # Python dependencies (Flask, requests)
├── .gitignore
├── templates/
│   └── index.html          # Main page — header, feed container, tweet modal
└── static/
    ├── css/
    │   └── style.css       # Dark glassmorphism design system
    └── js/
        └── app.js          # Fetch, render, expand/collapse, tweet logic
```

---

## 🔌 API

The Flask backend exposes a single internal endpoint consumed by the frontend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/release-notes` | Fetches and parses the BigQuery Atom feed; returns JSON |

### Example response

```json
{
  "status": "ok",
  "count": 30,
  "entries": [
    {
      "id": "...",
      "title": "June 17, 2026",
      "date": "June 17, 2026",
      "body_html": "<p>...</p>",
      "body_plain": "...",
      "link": "https://cloud.google.com/bigquery/docs/release-notes#june_17_2026"
    }
  ]
}
```

---

## 🐦 Twitter / X Sharing

Clicking **Tweet this** on any release note opens a modal pre-filled with:

```
<Release note title>

<Short excerpt from the release note body>

🔗 <link to the docs entry>
#BigQuery #GCP #GoogleCloud
```

The tweet text is editable before posting. Clicking **Post Tweet** opens the [Twitter Web Intent](https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent) in a small pop-up window — no API keys or OAuth required.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3, Flask |
| Feed parsing | Python `xml.etree.ElementTree` |
| HTTP client | `requests` |
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES2022) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Sharing | Twitter Web Intent (no API key needed) |

---

## 📦 Dependencies

```
flask>=3.0
requests>=2.31
```

---

## 🔧 Configuration

No environment variables are required to run locally. The feed URL is defined as a constant in [`app.py`](app.py):

```python
FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

> Built with ⚡ using Python Flask and plain vanilla HTML / CSS / JavaScript.
