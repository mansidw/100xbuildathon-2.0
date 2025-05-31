# Hiring Backend

A Flask-based backend service for a Hiring Copilot that leverages Large Language Models (LLMs) to streamline the recruitment process. The system provides intelligent candidate processing, resume analysis, and natural language database querying capabilities.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

- **Natural Language Database Queries**: Ask questions about your candidate data in plain English
- **Automated Resume Processing**: Extract structured information from candidate resumes
- **Intelligent Candidate Scoring**: Calculate match scores between candidates and job requirements
- **Multi-format Support**: Process PDF resumes and job descriptions
- **Database Management**: Dynamic table creation and data insights
- **Google Drive Integration**: Direct processing of resumes from Google Drive links

## Architecture

The system follows a modular architecture with clear separation of concerns:

```mermaid
graph TD
    User[User] --> Flask[Flask Server]
    Flask --> Routes[API Routes]
    Routes --> Service[ChatService]
    
    Service --> CrewAI[CrewAI Agents]
    CrewAI --> LLM[LiteLLM/Gemini]
    
    Service --> DB[(MySQL Database)]
    Service --> Files[File Processing]
    Files --> Temp[Temp Directory]
    
    CSV[CSV Files] --> Service
    PDF[PDF Files] --> Service
```

### Components

- **Flask Server**: HTTP request handling and routing
- **ChatService**: Core business logic and orchestration
- **CrewAI Agents**: Specialized LLM-powered agents for data processing and SQL generation
- **LiteLLM**: Unified interface for accessing Google Gemini models
- **MySQL Database**: Persistent storage for candidate data
- **File Processing**: PDF download and text extraction utilities

## Prerequisites

- Python 3.8+
- MySQL database server
- Google API key (for Gemini LLM access)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd <repository_directory>/server
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create temp directory**:
   ```bash
   mkdir temp
   ```

## Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
CONNECTION_URL=mysql://username:password@host:port/database_name
GOOGLE_API_KEY=your_google_api_key_here
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CONNECTION_URL` | MySQL database connection string | Yes |
| `GOOGLE_API_KEY` | Google API key for Gemini access | Yes |

## Usage

1. **Start the server**:
   ```bash
   python app.py
   ```

2. **Verify the server is running**:
   The server will start on `http://localhost:5000` by default.

3. **Test the endpoints**:
   Use the provided Postman collection or your preferred API testing tool.

## API Endpoints

### POST `/newChat`

Processes a batch of candidates against a job description.

**Request Format**: `multipart/form-data`

**Parameters**:
- `file` (CSV): Candidate list with `pdf_url` and `name` columns
- `job_description` (PDF): Job description document
- `tableName` (string): Target database table name

**Response**:
```json
{
  "message": "Processing completed successfully",
  "candidates_processed": 25,
  "table_name": "software_engineer_candidates"
}
```

### POST `/chat`

Query database tables using natural language.

**Request Body**:
```json
{
  "tableName": "candidates_table",
  "query": "Show me the top 5 candidates with Python experience"
}
```

**Response**:
```json
{
  "results": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "score": 85,
      "skills": "Python, Django, SQL"
    }
  ]
}
```

### GET `/gettables`

Retrieve all available database tables.

**Response**:
```json
{
  "tables": ["candidates_2024", "software_engineers", "data_scientists"]
}
```

### GET `/getinsights`

Get table structure and sample data.

**Query Parameters**:
- `tableName`: Name of the table to analyze

**Response**:
```json
{
  "columns": ["name", "email", "score", "skills"],
  "data": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "score": 92,
      "skills": "JavaScript, React, Node.js"
    }
  ]
}
```

## Development

### Project Structure

```
server/
├── app.py              # Flask application entry point
├── services/           # Business logic services
├── temp/              # Temporary file storage
├── requirements.txt   # Python dependencies
├── .env              # Environment configuration
└── postman_collection.json  # API testing collection
```

### Adding New Features

1. Add route handlers in `app.py`
2. Implement business logic in appropriate service modules
3. Update this README with new endpoint documentation
4. Add tests for new functionality

## Testing

### Using Postman

1. Import `postman_collection.json` into Postman
2. Create an environment with `base_url` set to `http://localhost:5000`
3. Update file paths in request bodies to point to your test files
4. Run the collection to test all endpoints

### Sample Test Data

Ensure your test CSV file includes:
- `name` column: Candidate names
- `pdf_url` column: URLs to resume PDFs (supports Google Drive links)

## Troubleshooting

### Common Issues

**Database Connection Errors**:
- Verify MySQL server is running
- Check `CONNECTION_URL` format and credentials
- Ensure database exists and is accessible

**PDF Processing Failures**:
- Verify PDF URLs are accessible
- Check Google Drive sharing permissions
- Ensure `temp/` directory exists and is writable

**LLM API Errors**:
- Validate `GOOGLE_API_KEY` is correct and active
- Check API quota limits
- Verify network connectivity to Google services

**File Upload Issues**:
- Ensure CSV files have required columns (`pdf_url`, `name`)
- Check file size limits
- Verify file formats (CSV for candidates, PDF for job descriptions)

### Debug Mode

Enable debug mode for detailed error logging:

```bash
export FLASK_DEBUG=1
python app.py
```

### Logs

Check application logs for detailed error information. The system logs:
- PDF download attempts
- Database operations
- LLM API calls
- File processing status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

[Add your license information here]

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the Postman collection for usage examples
- Open an issue in the repository
