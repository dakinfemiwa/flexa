from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_reports_api_and_database() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "flexa-api",
        "database": "ok",
    }
