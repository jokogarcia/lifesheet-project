# CV Agent
An agentic AI service that receives 2 inputs: a job description in markdown format and a job seeker's CV in JSON format.
The agent returns a version of the CV that is tailored to the job description. It highlights the most relevant items and removes information that is completely irrelevant.
It respects the structure of the original JSON.

## API
The agent is exposed via a web API.

### [POST] /tailor
Request body (json):
- cv: string. The CV of the job-seeker, in JSON format (stringified JSON).
- job-description: string. The description of the job, in markdown.
- additional-prompts?: string. Optional extra indications for the agent.

Successful response body (json):
- tailored-cv: The tailored CV in a compatible JSON format.
- tokens-used: The amount of tokens used in the request.

### [GET] /health
Simple health check returning `{ "status": "ok" }`.

## Tech stack
- Python 3.10+
- FastAPI + Uvicorn
- Pydantic v2
- Optional: Google AI SDK (Gemini). If no key is configured, the server runs in dev mode and returns a pass-through tailored CV with a meta note.

## Run locally
Using uv (recommended):
```bash
uv venv
. .venv/bin/activate
uv pip install -e .[ai]
uvicorn src.app.main:app --reload
```

## Docker
```bash
docker build -t cv-agent .
docker run -p 8000:8000 --env-file .env cv-agent
```

## Request/Response example
Request JSON:
```json
{
	"cv": "{\"name\":\"Alice\",\"skills\":[\"Python\",\"ML\"]}",
	"job-description": "We need a Python engineer with ML ops experience",
	"additional-prompts": "Emphasize ML ops"
}
```

Response JSON (dev mode):
```json
{
	"tailored-cv": {"name":"Alice","skills":["Python","ML"],"_meta":{"note":"[dev-mode] This CV would be tailored to the provided job description. Install/configure Google AI SDK to enable real tailoring."}},
	"tokens-used": 0
}
```

## Environment
Copy `.env.example` to `.env` and set `GOOGLE_API_KEY` to enable real tailoring via Google AI SDK.

