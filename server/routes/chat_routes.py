from flask import Blueprint, jsonify, request
from services.chat_service import ChatService
from services.insights_service import InsightsService
from services.peoples_api import PeoplesApi
import os
import pandas as pd
from werkzeug.utils import secure_filename
import tempfile
import requests
from PyPDF2 import PdfReader
import sqlite3
import json
import traceback

chat_bp = Blueprint("chat", __name__)
chat_service = ChatService()
insights_service = InsightsService()
peoples_api = PeoplesApi()


@chat_bp.route("/insights", methods=["GET"])
def get_insights():
    try:
        table_name = request.args.get("tableName")
        if not table_name:
            return jsonify({"error": "Missing tableName parameter"}), 400

        # Get insights for the specified table
        insights = insights_service.generate_insights(table_name)
        return jsonify(insights)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/candidate/<name>", methods=["GET"])
def get_candidate(name):
    try:
        candidate = chat_service.get_candidate_details_by_name(name)
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404
        return jsonify(candidate)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        table_name = data.get("tableName")
        query = data.get("query")
        user_id = data.get("user_id")

        if not table_name or not query:
            return jsonify({"error": "Missing tableName or query"}), 400

        result = chat_service.process_query(table_name, query, user_id)
        print("here with the rsult - ", result)
        if "followups" in result:
            return jsonify(
                {"result": result["response"], "followups": result["followups"]}
            )
        if "canned_response" in result:
            return jsonify({"result": result["canned_response"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/get-chats", methods=["GET"])
def getChats():
    try:
        table_name = request.args.get("tableName")
        user_id = request.args.get("user_id")

        if not table_name or not user_id:
            return jsonify({"error": "Missing tableName or user_id"}), 400

        chats = chat_service.get_all_chats_in_thread(table_name, user_id)
        return jsonify({"chats": chats})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/send-email", methods=["GET"])
def sendEmail():
    try:
        # table_name = request.args.get("tableName")
        # user_id = request.args.get("user_id")

        # if not table_name or not user_id:
        #     return jsonify({"error": "Missing tableName or user_id"}), 400

        chats = chat_service.send_mail_to_candidates(
            "send an email to mansi.dwivedi@spit.ac.in saying 'Hey how are you now?'"
        )
        return jsonify({"chats": chats})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/newChat", methods=["POST"])
def new_chat():
    try:
        if "csv" not in request.files or "pdf" not in request.files:
            return jsonify({"error": "Missing CSV or PDF file"}), 400

        csv_file = request.files["csv"]
        pdf_file = request.files["pdf"]
        table_name = request.form.get("tableName")

        if not table_name:
            return jsonify({"error": "Missing tableName"}), 400

        temp_dir = tempfile.mkdtemp()
        csv_path = os.path.join(temp_dir, secure_filename(csv_file.filename))
        pdf_path = os.path.join(temp_dir, secure_filename(pdf_file.filename))

        csv_file.save(csv_path)
        pdf_file.save(pdf_path)

        df = pd.read_csv(csv_path)

        pdf_reader = PdfReader(pdf_path)
        jd_text = ""
        for page in pdf_reader.pages:
            jd_text += page.extract_text()

        result = chat_service.process_new_chat(df, jd_text, table_name)

        os.remove(csv_path)
        os.remove(pdf_path)
        os.rmdir(temp_dir)

        return jsonify({"result": result})
    except Exception as e:
        tb = traceback.format_exc()
        print(f"/newChat error: {tb}")
        return jsonify({"error": str(e), "traceback": tb}), 500


@chat_bp.route("/gettables", methods=["GET"])
def get_tables():
    try:
        tables = chat_service.get_all_tables()
        return jsonify({"tables": tables})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/get-job-description", methods=["GET"])
def get_jobDesc():
    try:
        table_name = request.args.get("tableName")
        jobDesc = chat_service.get_job_description(table_name)
        return jsonify({"job_desc": jobDesc})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chat_bp.route("/chat/2", methods=["POST"])
def chat_to_elastic():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "")
        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400

        # Person schema summary for Gemini
        person_schema = '''
        Person Schema Fields:
        - first_name: The person's first name (string)
        - full_name: The person's full name (string)
        - id: Unique persistent identifier for the person (string)
        - last_initial: First letter of last name (string, 1 char)
        - last_name: The person's last name (string)
        - middle_initial: First letter of middle name (string, 1 char)
        - middle_name: The person's middle name (string)
        - name_aliases: Other names/aliases (array of strings)
        - emails: List of email objects (address, type, first_seen, last_seen, num_sources)
        - mobile_phone: Personal mobile phone (string)
        - personal_emails: All personal emails (array of strings)
        - phone_numbers: All phone numbers (array of strings)
        - phones: List of phone objects (number, first_seen, last_seen, num_sources)
        - recommended_personal_email: Best personal email (string)
        - work_email: Current work email (string)
        - job_company_*: Current company fields (name, id, industry, size, etc.)
        - job_title: Current job title (string)
        - job_title_role: Derived job role (string)
        - job_title_levels: Derived job levels (array)
        - job_start_date: Date started current job (string)
        - job_summary: User-inputted job summary (string)
        - birth_date: Date of birth (string)
        - birth_year: Year of birth (int)
        - sex: Person's sex (string)
        - languages: Languages known (array of objects)
        - education: Education info (array of objects)
        - location_*: Current address fields (country, region, locality, etc.)
        - profiles: Social profiles (array of objects)
        - skills: Self-reported skills (array of strings)
        - summary: Personal summary (string)
        - experience: Work experience history (array of objects). For querying years of experience, use 'inferred_years_experience'.
        - inferred_years_experience: Inferred total years of work experience (integer, 0-100). Use this for range queries on experience length.
        - ... (see docs for full list)
        '''

        gemini_instruction = f"""
        You are an expert in Elasticsearch and the Person schema below. Given the following user prompt, generate a JSON Elasticsearch query in this STRICT format only, using only valid fields from the schema:

        {person_schema}

        Example query format:
        {{
        "query": {{
            "bool": {{
                "must": [
                    {{"term": {{"location_country": "mexico"}}}},
                    {{"term": {{"job_title_role": "health"}}}},
                    {{"exists": {{"field": "phone_numbers"}}}}
                ]
            }}
        }}
        }}

        - Only return the JSON in the above format, filling in the query as needed based on the prompt.
        - Do not add any explanation or extra text.
        - If the prompt is empty, return the default query as above.
        - Use only fields from the Person schema above.
        - If the user asks for a field not in the schema, ignore it.
        - Use the most relevant fields for the user's intent.
        Prompt:
        {prompt}
        """

        from langchain_google_genai import ChatGoogleGenerativeAI
        import os
        import json

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0,
        )
        response = llm.invoke(gemini_instruction)
        content = response.content if hasattr(response, "content") else str(response)
        if content.strip().startswith("```json"):
            content = content.strip()[7:]
        if content.strip().startswith("```"):
            content = content.strip()[3:]
        if content.strip().endswith("```"):
            content = content.strip()[:-3]
        content = content.strip()
        try:
            elastic_query = json.loads(content)
        except Exception:
            elastic_query = content
        print("Elastic Query:", elastic_query)
        # Call People Data Labs API with the elastic query
        peoples_data = peoples_api.fetch_peoples_data(elastic_query)

        # --- Gemini summary for recruiter ---
        summary_prompt = f"""
        You are an expert recruiter assistant. Given the following global talent data search results, write a friendly, concise, and human-readable summary for a recruiter. Highlight the most relevant insights, trends, or interesting findings. If the data is empty, say so politely. Do not include raw JSON or code, just a readable summary.

        Data:
        {json.dumps(peoples_data)[:8000]}  # Truncate to avoid token overflow
        """
        summary_llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.2,
        )
        summary_response = summary_llm.invoke(summary_prompt)
        summary_content = summary_response.content if hasattr(summary_response, "content") else str(summary_response)

        return jsonify({
            "summary": summary_content,
            "raw": peoples_data
        })
    except Exception as e:
        tb = traceback.format_exc()
        print(f"/chat/2 error: {tb}")
        return jsonify({"error": str(e), "traceback": tb}), 500
