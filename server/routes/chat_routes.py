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
        chat_context = data.get("chat_context", [])  # Last 5 chats as context
        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400
        
        # Build context from previous chats
        context_string = ""
        if chat_context and len(chat_context) > 0:
            context_string = "\n\nPrevious conversation context:\n"
            for i, chat in enumerate(chat_context[-5:], 1):  # Last 5 chats
                if isinstance(chat, dict) and 'user_message' in chat and 'assistant_message' in chat:
                    context_string += f"{i}. User: {chat['user_message']}\n   Assistant: {chat['assistant_message']}\n"
                elif isinstance(chat, dict) and 'user' in chat and 'assistant' in chat:
                    context_string += f"{i}. User: {chat['user']}\n   Assistant: {chat['assistant']}\n"
        
        # Person schema summary for Gemini
        

        gemini_instruction = f"""
        You are an expert at generating Elasticsearch queries for a specific API. Your task is to analyze the user's prompt and classify it into one of two categories: "Talent Search" or "Background Verification".

        Based on the classification, generate a precise JSON Elasticsearch query using ONLY the structures provided below.

        **1. Intent Classification:**
        - **Talent Search**: User is looking for candidates with specific skills, experience, or location.
        - **Background Verification**: User is searching for a specific person by name.

        **2. Strict Query Generation Rules:**

        **If "Talent Search", use this EXACT structure. Do not add other clauses:**
        ```json
        {{
          "query": {{
            "bool": {{
              "must": [
                {{ "term": {{ "location_locality": "mumbai" }} }},
                {{ "range": {{ "inferred_years_experience": {{ "gte": 5 }} }} }},
                {{
                  "bool": {{
                    "should": [
                      {{ "match": {{ "job_title": "AI developer" }} }},
                      {{ "match": {{ "skills": "artificial intelligence" }} }}
                    ]
                  }}
                }}
              ]
            }}
          }},
          "size": 10
        }}
        ```

        **If "Background Verification", use this EXACT structure:**
        ```json
        {{
          "query": {{
            "bool": {{
              "must": [
                {{ "match": {{ "first_name": "john" }} }},
                {{ "match": {{ "last_name":"doe" }} }},
              ]
            }}
          }},
          "size": 1
        }}
        ```
        
        **CRITICAL INSTRUCTIONS:**
        - Return **ONLY** the raw JSON query. No text, explanations, or markdown.
        - **DO NOT** use any fields or clauses not present in the examples above. The `minimum_should_match` clause is **NOT SUPPORTED** and must not be used.
        - Extract entities from the user's prompt (like location, skills, name) and place them into the templates.
        
        **Conversation Context:**
        {context_string}

        **Current User Prompt:**
        "{prompt}"
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
            elastic_query = content # Keep as string if not valid json
        
        print("Generated Elasticsearch Query:", elastic_query)
        
        # Call People Data Labs API with the elastic query
        peoples_data = peoples_api.fetch_peoples_data(elastic_query)

        # --- Enhanced Gemini summary for recruiter with LinkedIn/GitHub URLs ---
        summary_prompt = f"""
        You are an expert recruiter assistant. Given the following global talent data search results, create a comprehensive and well-structured response in markdown format.

        Your response should include the following sections:
        
        ## Candidate Profiles
        For each person found, create a subsection using their actual name (e.g., ### John Doe). If no name is available, use "### Candidate [Number]". Then, list their details using bullet points with bolded labels.
        
        - **Name**: 
        - **Current Role**:
        - **Company**:
        - **Location**:
        - **Years of Experience**: (use 'inferred_years_experience' if available, otherwise calculate from experience)
        - **Key Skills**: (list top 5-7 skills)
        - **Contact**: (provide email if available, otherwise 'Not available')
        - **Social Profiles**: 
            - LinkedIn: [linkedin.com/in/username](https://linkedin.com/in/username)
            - GitHub: [github.com/username](https://github.com/username)
            - Twitter: [twitter.com/username](https://twitter.com/username)
        - **Professional Links**:
            - Company Website: [claravest.com](https://claravest.com)

        **IMPORTANT FORMATTING RULES:**
        - Always use proper markdown syntax
        - Use ### for candidate names (not #### or ##)
        - Use ** for bold labels
        - Use - for bullet points
        - Ensure all links are properly formatted as markdown links
        - If the data is empty, simply state: "No candidates found matching your criteria."

        Data:
        {json.dumps(peoples_data)[:8000]}
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
