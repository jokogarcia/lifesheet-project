Development README for CV Agent

Quickstart
- Python 3.10+
- Optional: set up .env with GOOGLE_API_KEY

Install
1. Create a venv with uv
2. uv pip install -e .[ai]

Run
- Dev server: uvicorn src.app.main:app --reload
- Health: GET /health
- Tailor: POST /tailor

Request body
{
  "cv": "<stringified JSON>",
  "job-description": "<markdown>",
  "additional-prompts": "optional"
}

Response
{
  "tailored-cv": { ... },
  "tokens-used": 0
}

Docker
- Build: docker build -t cv-agent .
- Run: docker run -p 8000:8000 --env-file .env cv-agent
