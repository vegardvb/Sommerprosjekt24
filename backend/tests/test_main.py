# backend/tests/test_main.py
import sys
import os
from fastapi.testclient import TestClient

# Ensure the backend directory is in the sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)


def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
