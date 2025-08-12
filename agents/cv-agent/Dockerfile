FROM ghcr.io/astral-sh/uv:python3.11-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy project files (use layers for better caching)
COPY pyproject.toml setup.cfg /app/
COPY src /app/src

# Install project with optional AI dependencies using uv (system install to avoid managing venv path)
RUN uv pip install --system -e .[ai]

# Expose and run
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
