# Dockerfile for the Finora RAG microservice.
# Uses Python 3.12 LTS slim image for minimal footprint.

FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed by faiss-cpu and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create FAISS data directory
RUN mkdir -p /app/data/faiss

# Expose service port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
