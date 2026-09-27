# AI-Based Sign Language Recognition and Learning System
> **Final Year Diploma Major Project Submission**  
> *A full-stack, responsive, viva-ready web application for real-time sign language gesture recognition, text-to-speech translation, and gamified sign language learning.*

---

## 📌 Project Overview
Communication barriers between the deaf/mute community and hearing society create significant challenges in education, healthcare, public transit, and emergency response. 

**SignAI System** is an end-to-end web platform that:
1. **Recognizes Sign Gestures in Real-Time** using standard RGB webcams via Google MediaPipe 21 3D skeletal hand landmarks + neural spatial-temporal classification.
2. **Translates Continuous Signs into Text & Voice** with Web Speech API audio synthesis.
3. **Provides an Interactive Sign Learning Academy** covering A-Z alphabets, daily vocabulary, visual flashcards, and timed assessment quizzes.
4. **Offers an Accessible Emergency SOS Communication Board** with tactile tiles, siren alarms, and speech broadcasting.
5. **Includes Student & Admin Telemetry Dashboards** with Chart.js analytics, confusion matrix evaluation, and downloadable diploma certification.
6. **Features Viva Voce Defense Modules** including full SRS documentation, system architecture diagrams, and 20+ exam defense questions & answers.

---

## 🚀 Key Modules & Features

### 1. Landing & Problem Statement Page
- Hero banner with live pulse indicators, problem statement overview, and objective metrics.
- 5-stage ML Pipeline overview.
- Key benefits and societal impact.

### 2. Real-Time AI Camera Recognizer (`#recognize`)
- Live webcam integration (`navigator.mediaDevices.getUserMedia`) with mirror viewfinder.
- Real-time 21-point hand skeleton canvas overlay with joint tracking.
- Synthetic landmark simulation fallback for demonstration on devices without webcams.
- Dynamic prediction confidence meter with classification text.
- One-touch Web Speech Text-to-Speech audio synthesizer.
- Image & video upload demonstration handler.

### 3. Continuous Sign-to-Text Translator (`#translator`)
- Live sentence stream buffer with blinking terminal cursor.
- Speech synthesis with speed/pitch controls.
- Persistent translation history ledger stored in `localStorage`.
- One-click `.txt` transcript file export.

### 4. Interactive Learning Academy (`#learn`)
- Complete A-Z ASL Alphabet dictionary with hand posture guides.
- Categorized vocabulary (Greetings, Daily Living, Numbers, Emergency, Family).
- Interactive flashcards with 3D details.
- Assessment Quiz Engine with 5 timed MCQs, score calculation, and celebration modal.

### 5. Accessible Emergency Communication Board (`#emergency`)
- High-contrast, large tactile SOS tiles (Medical, Police, Fire, Family, Assist).
- Priority Web Speech loud voice broadcasting.
- High-visibility visual strobe flash animation.
- Web Audio API Siren / Alarm Tone Generator (`AudioContext`).
- Simulated emergency GPS & SMS contact dispatcher.

### 6. Student Dashboard (`#dashboard`)
- Lesson completion progress tracker.
- Average accuracy score indicator (+streak counter).
- Weekly progress line chart with Chart.js.
- Personalized learning recommendations.

### 7. Admin & System Telemetry Dashboard (`#admin`)
- System KPI tiles (Total users, active inferences, latency).
- Model Architecture Benchmark Bar Chart (MediaPipe + LSTM vs Baseline CNN).
- Dataset Distribution Doughnut Chart.
- User management table with search filter and delete actions.

### 8. AI Innovation & Machine Learning Architecture (`#ai-innovation`)
- Interactive 5-Stage Machine Learning Pipeline.
- Multi-class Confusion Matrix evaluation table.
- Mathematical formulation of landmark normalization.
- Hardware & software deployment specifications.

### 9. AI Sign Tutor Chatbot Widget
- Floating AI assistant icon.
- Natural language intent matching for vocabulary lookup and model explanations.
- One-click prompt suggestions.

### 10. Automated Certificate of Completion
- High-resolution HTML5 Canvas diploma certificate.
- Rendered with gold borders, recipient name, verification ID, and signature.
- 1-click download as PNG.

### 11. Final Year Major Project Report & Viva Q&A Modal
- Executive Synopsis, Problem Statement, Objectives, and SRS.
- Detailed System Architecture diagram.
- 20+ Viva Voce questions & answers for oral examination defense.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend Framework** | Pure HTML5, Modern CSS3 (Glassmorphism & CSS Variables), JavaScript ES6+ |
| **Styling & Theming** | Custom CSS System, Dark/Light Mode, Responsive Grid |
| **Icons & Typography** | FontAwesome 6.4, Google Fonts (*Outfit*, *Plus Jakarta Sans*, *Fira Code*) |
| **Computer Vision** | Google MediaPipe 21 3D Hand Skeletal Landmark Architecture |
| **Audio & Speech** | W3C Web Speech Synthesis API & HTML5 Web Audio API (`AudioContext`) |
| **Data Visualization** | Chart.js 4.4 (Line, Bar, Doughnut charts) |
| **Document Generation**| HTML5 Canvas API (High-res PNG Certificate rendering) |
| **Local Server (Optional)**| Python 3 Built-in `http.server` |

---

## 📂 Project Structure

```
Sign Language Recognition/
├── index.html                   # Master SPA entry point containing all 11 modules
├── server.py                    # 1-click Python local server & auto-browser launcher
├── README.md                    # Project documentation & Viva Voce preparation guide
├── css/
│   ├── style.css               # Core design system, glassmorphism, responsive grid, dark mode
│   └── modules.css             # Module-specific styles (HUD, cards, emergency board, chatbot)
├── js/
│   ├── app.js                  # Master router, theme controller, speech wrapper, toast system
│   ├── auth.js                 # Authentication & user profile state manager
│   ├── recognizer.js           # Live webcam tracker, landmark skeleton canvas renderer, classifier
│   ├── translator.js           # Continuous sign-to-text sentence stream & history ledger
│   ├── learning.js             # Curriculum dictionary, flashcard modal & 5-question timed quiz
│   ├── dashboard.js            # Student analytics & Chart.js progress graph
│   ├── admin.js                # Admin telemetry, model benchmarks & user table
│   ├── emergency.js            # Emergency SOS board, siren audio generator & strobe alerts
│   ├── chatbot.js              # Interactive AI Sign Tutor assistant with NLP intent matcher
│   ├── certificate.js          # Dynamic HTML5 Canvas certificate renderer & PNG exporter
│   └── report.js               # Final Year Project Report & Viva Voce question bank
├── assets/                     # Media & asset directory
└── backend/                    # Backend services directory
```

---

## 💻 How to Run the Project

### Method 1: Direct Browser Launch (Simplest)
1. Open the folder `C:\Users\hp\OneDrive\Desktop\Sign Language Recognition\`.
2. Double-click **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Safari, or Firefox).

### Method 2: Using the Python Server Launcher
1. Open a terminal or PowerShell in this folder:
   ```bash
   cd "C:\Users\hp\OneDrive\Desktop\Sign Language Recognition"
   python server.py
   ```
2. The server will automatically start at `http://localhost:5500/index.html` and open in your default browser.

---

## 🎓 Viva Voce Key Defense Highlights

1. **Why MediaPipe landmarks instead of raw CNN image inputs?**  
   *Answer:* Raw image inputs are sensitive to skin tone, lighting conditions, and background noise. MediaPipe extracts 21 geometric 3D coordinate pairs, reducing dimensional complexity from millions of pixels to 63 invariant coordinates, enabling real-time 60 FPS inference in browsers.

2. **How does landmark normalization work?**  
   *Answer:* Coordinates are translated to the wrist joint as origin $(0,0,0)$ and scaled by the maximum distance from wrist to fingertip, making recognition invariant to hand distance and camera angles.

3. **How does the system handle continuous signs?**  
   *Answer:* Temporal sequence models (LSTM) capture trajectories across consecutive frame windows, accumulating recognized gestures into grammatical sentences.

---

## 📄 License & Academic Note
*Developed as an Academic Final Year Diploma Major Project Prototype. All code, UI components, and mock ML pipelines are structured for educational defense, presentations, and viva examinations.*
