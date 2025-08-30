# SmartDoc - AI-Powered Document Q&A System

SmartDoc is an innovative web application that allows users to upload documents and ask questions about their content using AI. Built with React, Flask, and Google's Gemini AI, it provides intelligent document analysis and question-answering capabilities.

## Features

- **Multi-format Support**: Upload PDF, DOCX, and TXT files
- **AI-Powered Q&A**: Ask questions about your documents and get intelligent answers
- **Vector Database**: Efficient document storage and retrieval using ChromaDB
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Real-time Chat**: Interactive conversation interface for document queries
- **Confidence Scoring**: AI provides confidence levels for answers
- **Source Attribution**: See which parts of the document were used to generate answers

## Technology Stack

### Frontend
- **React.js** - User interface framework
- **Tailwind CSS** - Styling and responsive design
- **Framer Motion** - Smooth animations and transitions
- **shadcn/ui** - Modern UI components
- **Lucide Icons** - Beautiful icon set

### Backend
- **Flask** - Python web framework
- **Google Gemini AI** - Text embeddings and generation
- **ChromaDB** - Vector database for document storage
- **PyPDF2** - PDF text extraction
- **python-docx** - Word document processing
- **Flask-CORS** - Cross-origin resource sharing

## Project Structure

```
smartdoc-project/
├── smartdoc-backend/          # Flask backend application
│   ├── src/
│   │   ├── routes/
│   │   │   ├── document.py    # Document upload and Q&A endpoints
│   │   │   └── user.py        # User management (template)
│   │   ├── models/            # Database models
│   │   ├── static/            # Built frontend files (for deployment)
│   │   └── main.py            # Flask application entry point
│   ├── venv/                  # Python virtual environment
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (API keys)
├── smartdoc-frontend/         # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentUpload.jsx    # File upload component
│   │   │   ├── QuestionAnswer.jsx    # Q&A interface component
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── App.jsx            # Main application component
│   │   └── main.jsx           # React entry point
│   ├── dist/                  # Built frontend files
│   └── package.json           # Node.js dependencies
└── README.md                  # This file
```

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 20+
- Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd smartdoc-backend
   ```

2. **Activate the virtual environment:**
   ```bash
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   - Edit the `.env` file
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

5. **Start the backend server:**
   ```bash
   python src/main.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup (Development)

1. **Navigate to the frontend directory:**
   ```bash
   cd smartdoc-frontend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install  # or npm install
   ```

3. **Start the development server:**
   ```bash
   pnpm run dev  # or npm run dev
   ```
   The frontend will run on `http://localhost:5173`

### Production Deployment

For production deployment, the frontend is already built and integrated into the Flask backend:

1. **Start only the backend server:**
   ```bash
   cd smartdoc-backend
   source venv/bin/activate
   python src/main.py
   ```

2. **Access the application:**
   - Open `http://localhost:5000` in your browser
   - The complete application (frontend + backend) will be served from this single URL

## API Endpoints

### Document Upload
- **POST** `/api/upload`
- Upload a document file (PDF, DOCX, TXT)
- Returns document ID and processing information

### Ask Question
- **POST** `/api/ask`
- Send a question about uploaded documents
- Returns AI-generated answer with confidence score and sources

### List Documents
- **GET** `/api/documents`
- Get list of all uploaded documents

## Usage

1. **Upload a Document:**
   - Click "Choose File" or drag and drop a document
   - Supported formats: PDF, DOCX, TXT
   - Wait for processing to complete

2. **Ask Questions:**
   - Type your question in the text area
   - Press Enter or click Send
   - View the AI-generated answer with confidence score

3. **View Sources:**
   - Each answer shows which document chunks were used
   - Confidence levels help you understand answer reliability

## Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key (required)

### Customization
- Modify chunk size and overlap in `document.py`
- Adjust UI colors and styling in `App.css`
- Configure CORS settings in `main.py`

## Troubleshooting

### Common Issues

1. **"Network error" when uploading:**
   - Ensure backend is running on port 5000
   - Check if Gemini API key is correctly set

2. **"No text could be extracted":**
   - File might be corrupted or password-protected
   - Try a different file format

3. **Slow responses:**
   - Large documents take more time to process
   - Gemini API rate limits may apply

### Development Tips

- Use browser developer tools to check network requests
- Check backend console for detailed error messages
- Ensure CORS is properly configured for cross-origin requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors
4. Verify all dependencies are installed correctly

---

**Built with ❤️ using React, Flask, and Google Gemini AI**

