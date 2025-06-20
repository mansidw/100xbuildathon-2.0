from flask import request, jsonify
from services.insights_service import InsightsService
from passlib.hash import bcrypt


class AuthController:
    def __init__(self):
        self.insights_service = InsightsService()

    def register(self):
        data = request.get_json()
        company_name = data.get("company_name")
        user_id = data.get("user_id")
        password = data.get("password")

        if not company_name or not user_id or not password:
            return (
                jsonify({"error": "company_name, user_id, and password are required"}),
                400,
            )

        password_hash = bcrypt.hash(password)
        try:
            conn = self.insights_service._get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO private.users (company_name, user_id, password_hash) VALUES (%s, %s, %s)",
                (company_name, user_id, password_hash),
            )
            conn.commit()
            cursor.close()
            return jsonify({"message": "User registered successfully"}), 201
        except Exception as e:
            if (
                "unique constraint" in str(e).lower()
                or "duplicate key" in str(e).lower()
            ):
                return jsonify({"error": "User ID already exists"}), 409
            return jsonify({"error": str(e)}), 500

    def login(self):
        data = request.get_json()
        user_id = data.get("user_id")
        password = data.get("password")

        if not user_id or not password:
            return jsonify({"error": "user_id and password are required"}), 400

        try:
            conn = self.insights_service._get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT password_hash FROM private.users WHERE user_id = %s", (user_id,)
            )
            result = cursor.fetchone()
            cursor.close()
            if not result:
                return jsonify({"error": "Invalid user_id or password"}), 401
            password_hash = result[0]
            if not bcrypt.verify(password, password_hash):
                return jsonify({"error": "Invalid user_id or password"}), 401
            return jsonify({"message": "Login successful"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
