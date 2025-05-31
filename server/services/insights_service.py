from crewai import Agent, Task, Crew
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os
import json

load_dotenv()

class InsightsService:
    def __init__(self):
        # Initialize the LLM with Gemini
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )
        
        # Create agents
        self.data_analyst = Agent(
            role='Data Analyst',
            goal='Analyze data and identify patterns',
            backstory='Expert in data analysis and pattern recognition',
            llm=self.llm,
            verbose=True
        )
        
        self.insight_generator = Agent(
            role='Insight Generator',
            goal='Generate actionable insights from data analysis',
            backstory='Expert in business intelligence and insight generation',
            llm=self.llm,
            verbose=True
        )

    def generate_insights(self, table_name, data):
        """
        Generate insights from table data using CrewAI agents
        """
        try:
            # Create tasks for the crew
            analysis_task = Task(
                description=f"""Analyze this data from the {table_name} table and identify key patterns and trends.
                Data: {json.dumps(data)}
                Return a JSON object with the following structure:
                {{
                    "patterns": ["pattern1", "pattern2", ...],
                    "trends": ["trend1", "trend2", ...],
                    "anomalies": ["anomaly1", "anomaly2", ...]
                }}""",
                agent=self.data_analyst,
                expected_output="A JSON object containing patterns, trends, and anomalies"
            )
            
            insight_task = Task(
                description=f"""Based on the analysis of the {table_name} table, generate actionable insights.
                Return a JSON object with the following structure:
                {{
                    "insights": ["insight1", "insight2", ...],
                    "recommendations": ["recommendation1", "recommendation2", ...],
                    "key_metrics": ["metric1", "metric2", ...]
                }}""",
                agent=self.insight_generator,
                expected_output="A JSON object containing insights, recommendations, and key metrics"
            )
            
            # Create and run the crew
            crew = Crew(
                agents=[self.data_analyst, self.insight_generator],
                tasks=[analysis_task, insight_task],
                verbose=True
            )
            
            result = crew.kickoff()
            return json.loads(result)
            
        except Exception as e:
            raise Exception(f"Error generating insights: {str(e)}") 