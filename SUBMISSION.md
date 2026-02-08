# Take2 AI Assessment Submission

**Candidate:** [Your Name]
**Position:** Senior Software Engineer, Full Stack
**Date:** [Date]

## Live Demo
- **Frontend:** [Vercel URL]
- **Backend API:** [Railway URL]
- **GitHub:** [Repo URL]

## Features Implemented
✅ File upload (drag-drop + browse)
✅ Deepgram transcription (Nova-2 + diarization)
✅ Inline editing (text + speaker toggle)
✅ Speaker bubbles (color-coded)
✅ Audio player (custom controls + HTML5 fallback)
✅ Error handling
✅ Responsive design

## Tech Stack
- Backend: Node.js + Express
- Frontend: React (Create React App - NO VITE)
- API: Deepgram SDK
- Deployment: Railway + Vercel

## Time Breakdown (~5 hours)
- Hour 1: Backend API + Deepgram integration
- Hour 2: React components + state
- Hour 3: Editing functionality
- Hour 4: UI polish + audio player
- Hour 5: Deployment + docs

## Key Decisions
1. **Create React App** instead of Vite - Better production stability
2. **In-memory storage** - Fast development, acceptable for POC
3. **ContentEditable** - Natural editing UX
4. **Simple useState** - No complex state management needed

## Tradeoffs
- Temporary storage vs PostgreSQL (faster dev)
- No edit history vs version control (out of scope)
- Custom controls vs library (learning experience)

## Known Limitations
- Files lost on server restart
- No authentication
- Single-user mode

## IMPORTANT IMPLEMENTATION NOTES

1. Backend MUST use ES modules ("type": "module" in package.json)
2. Backend MUST handle __dirname using fileURLToPath
3. Frontend uses Create React App with proxy in package.json
4. Frontend does NOT use Vite
5. All icons are inline SVG (no icon library imports except optional lucide-react)
6. CSS is in index.css with class-based styling
7. Use simple inline styles where needed
8. Keep all state management simple with useState only
