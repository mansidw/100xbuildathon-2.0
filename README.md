# Hire AI - Intelligent HR Assistant

A comprehensive AI-powered HR assistant that helps recruiters analyze candidate data and search the global talent pool with intelligent insights.

## Features

### Database Chat
- **Upload & Analyze**: Upload job descriptions (PDF) and candidate data (CSV) for AI-powered analysis
- **Smart Insights**: Get detailed analysis of skills, experience, and hiring recommendations
- **Contextual Conversations**: AI maintains context from previous conversations for better follow-up questions
- **Professional Actions**: Send emails and create calendar events directly from the chat interface

### Global Chat (NEW!)
- **Global Talent Search**: Search the worldwide talent pool using People Data Labs API
- **Context-Aware Conversations**: Maintains conversation context from the last 5 chats for better follow-up searches
- **Professional Link Display**: Automatically extracts and displays LinkedIn, GitHub, Twitter, and email links
- **Rich Candidate Profiles**: View comprehensive candidate information including:
  - Current role and company
  - Years of experience
  - Key skills and technologies
  - Location and contact information
  - Professional social profiles
- **Interactive Follow-ups**: Quick action buttons for common search refinements

### Enhanced UI/UX
- **Modern Dark Theme**: Sleek black and white design with smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Processing**: Beautiful loading animations and progress indicators
- **Professional Link Cards**: Dedicated sections for LinkedIn, GitHub, and other professional links
- **Markdown Support**: Rich text formatting for better readability

## Technical Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Markdown** for rich text display
- **Lucide React** for icons

### Backend
- **Python Flask** with RESTful API
- **PostgreSQL** for data storage
- **Google Gemini AI** for natural language processing
- **People Data Labs API** for global talent search
- **Composio** for email and calendar integrations

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 100xbuildathon-2.0
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd client
   npm install
   
   # Backend
   cd ../server
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # In client/.env
   VITE_BACKEND_URL=http://localhost:5000
   
   # In server/.env
   GOOGLE_API_KEY=your_gemini_api_key
   CONNECTION_URL=your_postgres_connection_string
   PEOPLE_DATA_LABS_API_KEY=your_pdl_api_key
   ```

4. **Run the application**
   ```bash
   # Backend
   cd server
   python app.py
   
   # Frontend (in another terminal)
   cd client
   npm run dev
   ```

## Usage

### Database Chat
1. Click "Start New Analysis"
2. Select "Database Chat"
3. Enter role name and upload job description and candidate data
4. Start asking questions about your candidates

### Global Chat
1. Click "Start New Analysis"
2. Select "Global Chat"
3. Enter a chat name
4. Search for global talent with natural language queries
5. View professional links and candidate profiles
6. Use follow-up questions to refine your search

## API Endpoints

- `POST /newChat` - Create new database chat
- `POST /chat` - Send message to database chat
- `POST /chat/2` - Send message to global chat (with context)
- `GET /gettables` - Get all chat tables
- `GET /get-chats` - Get chat history
- `GET /get-job-description` - Get job description summary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
