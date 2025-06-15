# Recruiter AI Chat Interface

## Environment Setup

1. Create a `.env` file in the root directory
2. Copy the contents from `.env.example` to `.env`
3. Update the values in `.env` with your configuration:

```env
# Backend API URL - Required
VITE_BACKEND_URL=your_backend_url_here
```

Note: Never commit the `.env` file to version control. The `.env.example` file serves as a template.

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| VITE_BACKEND_URL | Backend API endpoint URL | Yes | None |

Make sure to set up your environment variables before starting the application. 