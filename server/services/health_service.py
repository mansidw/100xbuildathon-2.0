class HealthService:
    @staticmethod
    def check_health():
        return {"status": "healthy", "message": "Server is running"}
