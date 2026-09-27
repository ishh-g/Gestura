# Gestura - Sign Language Studio
> *A warm, responsive web application for learning sign language, practicing with a live mirror, translating phrases into speech, and tracking progress.*

---

## Project Overview
Communication barriers between the deaf and hard-of-hearing community and hearing society create significant challenges in education, healthcare, public transit, and emergency response.

**Gestura** is an end-to-end web platform that:
1. **Reads Sign Gestures in Real-Time** using a standard RGB webcam via 21 hand landmarks and a hold-to-confirm shape reader.
2. **Turns Signs into Text & Voice** with Web Speech API audio synthesis.
3. **Teaches Through a Learning Academy** covering A-Z alphabets, numbers 0-10, daily vocabulary, visual flashcards, and timed assessment quizzes.
4. **Offers an Accessible Help Board** with large tactile tiles, chime alerts, and speech broadcasting.
5. **Includes Student & Studio Progress Views** with Chart.js analytics and a downloadable certificate of completion.

---

## Key Modules & Features

### 1. Landing Page
- Hero banner with today's sign, practice preview card, and quick learning paths.
- Learn / Practice / Understand walkthrough.
- Live learning-journey preview fed by real learner progress.

### 2. Live Practice Mirror (`#recognize`)
- Live webcam integration (`navigator.mediaDevices.getUserMedia`) with mirror viewfinder.
- Real-time hand tracking canvas overlay with a calm label box.
- Hold-to-confirm reading (Hello, 0-9, Thank You, Yes, No, Please, I Love You).
- One-touch Web Speech text-to-speech audio.
- Photo upload reading handler.

### 3. Phrases & Voice (`#translator`)
- Live sentence stream buffer with blinking terminal cursor.
- Speech synthesis for anything transcribed.
- Persistent translation history ledger stored in `localStorage`.
- One-click `.txt` transcript file export.

### 4. Learning Academy (`#learn`)
- Complete A-Z alphabet dictionary with hand posture guides.
- Numbers 0-10 with hand-shape diagrams.
- Categorized vocabulary (Greetings, Daily Living, Help).
- Interactive flashcards with hand-shape diagrams.
- Assessment Quiz Engine with 5 timed visual questions, score calculation, and celebration modal.

### 5. Accessible Help Board (`#emergency`)
- Large tactile help tiles (Medical, Police, Fire, Family, Assist).
- Web Speech voice broadcasting.
- Gentle visual flash animation.
- Web Audio API chime generator (`AudioContext`).

### 6. Student Dashboard (`#dashboard`)
- Lesson completion progress tracker.
- Average accuracy score indicator (+streak counter).
- Weekly progress line chart with Chart.js.
- Personalized learning recommendations.

### 7. Studio Panel (`#admin`)
- System tiles (registered users, live sessions, readings).
- Reading steadiness bar chart.
- Sign coverage doughnut chart.
- User management table with search filter and delete actions.

### 8. How It Reads (`#ai-innovation`)
- Plain-language 5-step pipeline from hand to word.
- Sample evaluation table.
- Landmark normalization explanation.
- Hardware & software deployment specifications.

### 9. Sign Tutor Chatbot Widget
- Floating tutor button.
- Natural language intent matching for vocabulary lookup and studio guidance.
- One-click prompt suggestions.

### 10. Certificate of Completion
- High-resolution HTML5 Canvas certificate.
- Rendered with recipient name, date, and verification note.
- 1-click download as PNG.

---

## Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | Pure HTML5, Modern CSS3 (CSS Variables), JavaScript ES6+ |
| **Styling & Theming** | Custom CSS System, Light/Dark Mode, Responsive Grid |
| **Icons & Typography** | FontAwesome 6.4, Google Fonts (*Bodoni Moda*, *Inter*) |
| **Hand Tracking** | MediaPipe HandLandmarker (21 landmarks, on-device) |
| **Audio & Speech** | W3C Web Speech Synthesis API & HTML5 Web Audio API (`AudioContext`) |
| **Data Visualization** | Chart.js 4.4 (Line, Bar, Doughnut charts) |
| **Document Generation**| HTML5 Canvas API (High-res PNG Certificate rendering) |
| **Local Server (Optional)**| Python 3 Built-in `http.server` |

---

## Project Structure

```
Gestura/
├── index.html                   # SPA entry point with all views
├── server.py                    # 1-click Python local server & auto-browser launcher
├── README.md                    # Project documentation
├── css/
│   ├── style.css               # Core design system, responsive grid, themes
│   └── modules.css             # Module-specific styles (mirror, cards, help board, chatbot)
├── js/
│   ├── app.js                  # Master router, theme controller, speech wrapper, toast system
│   ├── auth.js                 # Authentication & user profile state manager
│   ├── recognizer.js           # Live webcam tracker, landmark canvas renderer, classifier
│   ├── translator.js           # Phrase stream, speech & history ledger
│   ├── learning.js             # Curriculum dictionary, hand-shape diagrams, 5-question timed quiz
│   ├── dashboard.js            # Student analytics & Chart.js progress graph
│   ├── admin.js                # Studio panel, steadiness benchmarks & user table
│   ├── emergency.js            # Help board, chime generator & flash alerts
│   ├── chatbot.js              # Sign Tutor assistant with intent matcher
│   └── certificate.js          # Dynamic HTML5 Canvas certificate renderer & PNG exporter
├── assets/                     # Media & asset directory
└── backend/                    # Backend services directory
```

---

## How to Run the Project

### Method 1: Using the Python Server Launcher (Recommended)
1. Open a terminal or PowerShell in this folder:
   ```bash
   cd "C:\Users\hp\OneDrive\Desktop\Sign Language Recognition"
   python server.py
   ```
2. The server will automatically start at `http://localhost:5500/index.html` and open in your default browser.

### Method 2: Direct Browser Launch
1. Open the project folder.
2. Double-click **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Safari, or Firefox).
3. Note: camera access and the hand-tracking model load most reliably over `http://localhost:5500` (Method 1).

---

## License
*Built as a sign language learning studio. All code and UI components are structured for real everyday use — learning, practicing, and communicating.*
