from __future__ import annotations

import json
import os
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ValidationError

from .ai import tailor_cv


app = FastAPI(title="CV Agent", version="0.1.0")


class TailorRequest(BaseModel):
    cv: str
    job_description: str = Field(alias="job-description")
    additional_prompts: Optional[str] = Field(default=None, alias="additional-prompts")

    class Config:
        populate_by_name = True


class TailorResponse(BaseModel):
    tailored_cv: Dict[str, Any] = Field(alias="tailored-cv")
    tokens_used: int = Field(alias="tokens-used")

    class Config:
        populate_by_name = True


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/tailor")
def tailor_endpoint(req: TailorRequest) -> JSONResponse:
    # Validate and parse input CV JSON string
    try:
        original_cv = json.loads(req.cv)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid 'cv' JSON: {e}")

    try:
        tailored, tokens_used = tailor_cv(
            original_cv=original_cv,
            job_description=req.job_description,
            additional_prompts=req.additional_prompts,
        )
    except ValidationError as e:
        # Bubble up pydantic validation errors clearly
        raise HTTPException(status_code=400, detail=e.errors())
    except HTTPException:
        raise
    except Exception as e:
        # Obscure internal errors
        raise HTTPException(status_code=500, detail="Failed to tailor CV") from e

    # Ensure result is JSON-serializable
    try:
        json.dumps(tailored)
    except TypeError as e:
        raise HTTPException(status_code=500, detail=f"Tailored CV is not JSON-serializable: {e}")

    resp = TailorResponse(tailored_cv=tailored, tokens_used=tokens_used)
    return JSONResponse(content=resp.model_dump(by_alias=True))


if __name__ == "__main__":
    # Simple dev runner: uvicorn src.app.main:app --reload
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("src.app.main:app", host="0.0.0.0", port=port, reload=True)
