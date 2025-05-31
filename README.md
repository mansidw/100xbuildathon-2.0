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
- [Sample Responses](#sample-responses)
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

## Sample Responses

### 1. Natural Language Queries

#### Example 1: Finding Top Candidates
**Query**: "Show me the top 5 candidates with Python experience"
```json
{
  "explanation": "Here are the top 5 candidates with Python experience, sorted by their match scores:",
  "results": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "score": 95,
      "skills": "Python, Django, SQL, AWS",
      "experience": "5 years in Python development"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "score": 92,
      "skills": "Python, Flask, Machine Learning",
      "experience": "4 years in data science"
    }
  ],
  "sql_query": "SELECT * FROM candidates WHERE skills ILIKE '%Python%' ORDER BY score DESC LIMIT 5",
  "total_results": 5
}
```

#### Example 2: Skill Analysis
**Query**: "What are the most common skills among candidates with scores above 80?"
```json
{
  "explanation": "The most common skills among high-scoring candidates (>80) are:",
  "results": {
    "skills": [
      {"skill": "Python", "count": 15},
      {"skill": "JavaScript", "count": 12},
      {"skill": "AWS", "count": 10}
    ],
    "total_candidates": 25
  },
  "sql_query": "SELECT skills, COUNT(*) FROM candidates WHERE score > 80 GROUP BY skills ORDER BY count DESC",
  "total_results": 3
}
```

### 2. Resume Processing

#### Example 1: New Candidate Processing
**Request**: Process new candidates with job description
```json
{
  "message": "Processing completed successfully",
  "details": {
    "candidates_processed": 25,
    "table_name": "software_engineer_candidates",
    "columns_created": [
      "name",
      "email",
      "phone",
      "skills",
      "experience",
      "education",
      "score"
    ],
    "processing_time": "45.2 seconds"
  }
}
```

#### Example 2: Candidate Information Extraction
**Input**: Resume PDF
```json
{
  "extracted_info": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "skills": [
      "Python",
      "Django",
      "PostgreSQL",
      "AWS",
      "Docker"
    ],
    "experience": [
      {
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "duration": "2020-Present",
        "description": "Led development of microservices architecture"
      }
    ],
    "education": [
      {
        "degree": "B.S. Computer Science",
        "institution": "University of Technology",
        "year": "2018"
      }
    ]
  }
}
```

### 3. Table Insights

#### Example 1: Get Table Structure
**Request**: Get insights for "software_engineer_candidates"
```json
{
  "columns": [
    {
      "name": "id",
      "type": "SERIAL",
      "description": "Primary key"
    },
    {
      "name": "name",
      "type": "TEXT",
      "description": "Candidate's full name"
    },
    {
      "name": "score",
      "type": "TEXT",
      "description": "Match score (0-100)"
    }
  ],
  "sample_data": [
    {
      "id": 1,
      "name": "John Doe",
      "score": "95",
      "skills": "Python, Django, AWS"
    }
  ],
  "total_records": 150,
  "last_updated": "2024-03-15T10:30:00Z"
}
```

#### Example 2: Error Response
**Request**: Query non-existent table
```json
{
  "error": "Table 'non_existent_table' not found or has no accessible columns.",
  "suggestions": [
    "Check the table name spelling",
    "Verify the table exists in the database",
    "Ensure you have proper permissions"
  ]
}
```

## Complete API Examples

### 1. Process New Candidates

**Request**:
```http
POST /newChat
Content-Type: multipart/form-data

file: candidates.csv
job_description: job_description.pdf
tableName: software_engineer_candidates
```

**Response**:
```json
{
  "message": "Processing completed successfully",
  "details": {
    "candidates_processed": 25,
    "table_name": "software_engineer_candidates",
    "columns_created": [
      "name",
      "email",
      "phone",
      "skills",
      "experience",
      "education",
      "score"
    ],
    "processing_time": "45.2 seconds",
    "sample_data": {
      "first_candidate": {
        "name": "John Doe",
        "email": "john@example.com",
        "score": "95",
        "skills": "Python, Django, AWS"
      }
    }
  }
}
```

### 2. Natural Language Query

**Request**:
```http
POST /chat
Content-Type: application/json

{
  "tableName": "software_engineer_candidates",
  "query": "Show me candidates with Python experience and AWS certification"
}
```

**Response**:
```json
{
  "explanation": "Found 3 candidates with Python experience and AWS certification:",
  "results": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "score": "95",
      "skills": "Python, Django, AWS, AWS Solutions Architect",
      "experience": "5 years in cloud development"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "score": "92",
      "skills": "Python, Flask, AWS, AWS Developer Associate",
      "experience": "4 years in backend development"
    }
  ],
  "sql_query": "SELECT * FROM software_engineer_candidates WHERE skills ILIKE '%Python%' AND skills ILIKE '%AWS%' ORDER BY score DESC",
  "total_results": 3,
  "execution_time": "1.2 seconds"
}
```

### 3. Get Table Structure

**Request**:
```http
GET /getinsights?tableName=software_engineer_candidates
```

**Response**:
```json
{
  "table_info": {
    "name": "software_engineer_candidates",
    "total_records": 150,
    "last_updated": "2024-03-15T10:30:00Z"
  },
  "columns": [
    {
      "name": "id",
      "type": "SERIAL",
      "description": "Primary key"
    },
    {
      "name": "name",
      "type": "TEXT",
      "description": "Candidate's full name"
    },
    {
      "name": "email",
      "type": "TEXT",
      "description": "Candidate's email address"
    },
    {
      "name": "score",
      "type": "TEXT",
      "description": "Match score (0-100)"
    }
  ],
  "sample_data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "score": "95",
      "skills": "Python, Django, AWS"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "score": "92",
      "skills": "Python, Flask, Machine Learning"
    }
  ]
}
```

### 4. Error Handling Examples

#### Invalid Table Name
**Request**:
```http
POST /chat
Content-Type: application/json

{
  "tableName": "non_existent_table",
  "query": "Show me all candidates"
}
```

**Response**:
```json
{
  "error": "Table 'non_existent_table' not found or has no accessible columns.",
  "suggestions": [
    "Check the table name spelling",
    "Verify the table exists in the database",
    "Ensure you have proper permissions"
  ],
  "available_tables": [
    "software_engineer_candidates",
    "data_scientist_candidates",
    "product_manager_candidates"
  ]
}
```

#### Invalid File Format
**Request**:
```http
POST /newChat
Content-Type: multipart/form-data

file: invalid.txt
job_description: job_description.pdf
tableName: new_candidates
```

**Response**:
```json
{
  "error": "Invalid file format",
  "details": {
    "expected_format": "CSV",
    "received_format": "TXT",
    "required_columns": ["name", "pdf_url"]
  },
  "suggestions": [
    "Ensure the file is in CSV format",
    "Verify the file contains required columns",
    "Check file encoding (UTF-8 recommended)"
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
