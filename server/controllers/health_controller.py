from flask import jsonify
from services.health_service import HealthService

class HealthController:
    def __init__(self):
        self.health_service = HealthService()

    def check_health(self):
        health_status = self.health_service.check_health()
        return jsonify(health_status), 200 