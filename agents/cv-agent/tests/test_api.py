import json
from fastapi.testclient import TestClient
from src.app.main import app


client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_tailor_dev_mode():
    body = {
        "cv": json.dumps({"name": "Alice", "experience": ["X", "Y"]}),
        "job-description": "We need Python skills",
    }
    r = client.post("/tailor", json=body)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "tailored-cv" in data
    assert "tokens-used" in data
    assert isinstance(data["tailored-cv"], dict)


def test_tailor_invalid_cv():
    body = {
        "cv": "{not json}",
        "job-description": "anything",
    }
    r = client.post("/tailor", json=body)
    assert r.status_code == 400
    assert "Invalid 'cv' JSON" in r.json()["detail"]
