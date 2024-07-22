
# backend/tests/test_main.py
"""
This module contains unit tests for the main endpoints of the application.
"""
# pylint: disable=import-error

# Ensure the backend directory is in the sys.path
import os
import sys
from fastapi.testclient import TestClient
from main import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


client = TestClient(app)


def test_read_main():
    """
    Test case to check the response of the main endpoint.

    It sends a GET request to the root endpoint ("/") and asserts that the response
    status code is 200, indicating a successful request.

    """
    response = client.get("/")
    assert response.status_code == 200


def test_get_terrain():
    """
    Test case for the 'get_terrain' endpoint.

    This test sends a GET request to the '/fetch-geotiff' endpoint with specific parameters
    and asserts that the response status code is 200 and the content-type is 'application/json'.
    """
    response = client.get(
        "/fetch-geotiff?bbox=272669,7037582,273109,7038148&width=440&height=566")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
