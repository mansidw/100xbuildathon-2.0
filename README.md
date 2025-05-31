# Hiring Backend

This project implements the backend for a Hiring Copilot, leveraging Large Language Models (LLMs) and database interactions to assist with the recruitment process. The server is built with Flask and integrates various tools for tasks like talent search, resume processing, and candidate evaluation.

## Features and Endpoints

The server exposes several API endpoints to provide the core functionality:

### `/chat [POST]`

-   **Description**: Processes natural language queries against a specified database table using a SQL agent. This allows users to get information from the database by asking questions in plain English.
-   **How it works**:
    -   Receives `tableName` and `query` in a JSON payload.
    -   Utilizes a CrewAI agent configured with `langchain_community.utilities.SQLDatabase` and a LiteLLM-powered Gemini model to interpret the query.
    -   Translates the natural language query into SQL and executes it against the specified table in the connected MySQL database.
    -   Returns the results of the SQL query.

### `/newChat [POST]`

-   **Description**: Initiates a new candidate processing batch. This endpoint takes a job description and a list of candidates with resume links, processes them, and stores relevant information in the database.
-   **How it works**:
    -   Accepts a CSV file (`.csv`) containing candidate information (must include a `pdf_url` column and typically a `name` column).
    -   Accepts a PDF file (`.pdf`) containing the job description.
    -   Accepts `tableName` as a form-data field to specify where to store candidate data.
    -   Downloads and extracts text from the candidate resume PDFs (supports Google Drive links and direct URLs). Temporary PDF files are stored in the `/server/temp` directory.
    -   Uses a CrewAI Data Processor agent powered by LiteLLM/Gemini to:
        -   Analyze the job description to determine relevant data points/columns for candidates.
        -   Extract structured information (name, email, skills, experience, etc.) from each candidate's resume text.
        -   Calculate a match score (0-100) comparing the candidate's profile to the job description.
    -   Creates a new table in the MySQL database based on the extracted columns (including a `score` column) if it doesn't exist.
    -   Inserts the extracted candidate information and calculated score into the database table.

### `/gettables [GET]`

-   **Description**: Retrieves a list of all available tables in the connected MySQL database.
-   **How it works**:
    -   Connects to the MySQL database.
    -   Queries the database's information schema to get the names of all tables in the current database.
    -   Returns a JSON array of table names.

### `/getinsights [GET]`

-   **Description**: Retrieves data and basic structural insights for a specified table.
-   **How it works**:
    -   Takes `tableName` as a query parameter.
    -   Connects to the MySQL database.
    -   Retrieves the column names for the specified table.
    -   Fetches the first 100 rows of data from the table.
    -   Returns a JSON object containing the list of column names and the fetched table data.

## Architecture

The server follows a layered architecture:

-   **Flask Routes**: Handle incoming HTTP requests and route them to the appropriate service methods.
-   **ChatService**: Contains the core logic for processing chat queries and new candidate data. It orchestrates the use of CrewAI agents and interacts with the database.
-   **CrewAI Agents**: Specialized agents (Data Processor, SQL Expert) that use LLMs to perform complex tasks like text analysis, information extraction, and SQL generation.
-   **LiteLLM**: Provides a unified interface to access various LLMs, specifically used here to interact with Google's Gemini models.
-   **Database (MySQL)**: Stores candidate data and provides information about available tables. Interactions are managed via SQLAlchemy's `SQLDatabase` or direct PyMySQL connections where needed.
-   **Temporary Files**: A `/server/temp` directory is used to temporarily store downloaded PDF resumes during the `/newChat` process.

```mermaid
graph TD
    User -- HTTP Requests --> FlaskApp
    FlaskApp[Flask Server] --> ChatRoutes[(/chat, /newChat, /gettables, /getinsights)]

    ChatRoutes -- Call Services --> ChatService[ChatService]

    ChatService -- orchestrates --> CrewAI[CrewAI Agents]
    CrewAI --> LiteLLM(LiteLLM - Gemini)
    LiteLLM -- processes --> JobDesc(Job Description PDF)
    LiteLLM -- processes --> ResumeText[Resume Text]

    ChatService -- downloads --> PDFs[PDF Resumes (URLs)]
    PDFs --> TempDir[Temp Files Dir]
    TempDir --> ResumeText[Resume Text]

    ChatService -- interacts with --> MySQL[(MySQL Database)]
    CrewAI -- (SQL Queries) --> MySQL

    CSV[CSV (Candidate List)] -- processed by --> ChatService
```

## Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd <repository_directory>/server
    ```
2.  **Set up Environment Variables**: Create a `.env` file in the `server` directory with your database connection URL and Google API key:
    ```dotenv
    CONNECTION_URL="mysql://user:password@host:port/database"
    GOOGLE_API_KEY="YOUR_GOOGLE_API_KEY"
    ```
    Replace the placeholders with your actual MySQL database credentials and Google API key.
3.  **Install Dependencies**: Make sure you have Python and pip installed. Then, install the required packages:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Database Setup**: Ensure your MySQL database is running and accessible via the provided `CONNECTION_URL`. The application will attempt to create tables as needed.

## Usage

Run the Flask server from the `server` directory:

```bash
python app.py
```

The API endpoints can be accessed using tools like Postman, curl, or a custom frontend application. A Postman collection has been provided (`server/postman_collection.json`) for easy testing of the endpoints.

-   Import `server/postman_collection.json` into Postman.
-   Set up an environment variable `base_url` pointing to your server (e.g., `http://localhost:5000`).
-   Update the file paths in the `/newChat` request body to point to your local CSV and PDF files.

## Development Notes

-   Temporary PDF files are stored in `./server/temp`. Ensure this directory exists or the application has permissions to create it.
-   The manual SQL formatting used for debugging the `%%s` issue in `process_new_chat` (`insert_sql_manual` and related code) is commented out. The primary insertion logic uses `db.run()` with parameterized queries, which is the secure approach.

--- 