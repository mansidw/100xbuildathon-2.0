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
            goal='Analyze data and extract meaningful insights',
            backstory='Expert in data analysis and pattern recognition',
            llm=self.llm,
            verbose=True
        )
        
        self.insight_generator = Agent(
            role='Insight Generator',
            goal='Generate actionable insights from analyzed data',
            backstory='Expert in business intelligence and data interpretation',
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
                description=f"Analyze the following data from {table_name} and identify key patterns and trends:\n{json.dumps(data, indent=2)}",
                agent=self.data_analyst
            )
            
            insight_task = Task(
                description="Based on the analysis, generate actionable insights and recommendations",
                agent=self.insight_generator
            )
            
            # Create and run the crew
            crew = Crew(
                agents=[self.data_analyst, self.insight_generator],
                tasks=[analysis_task, insight_task],
                verbose=True
            )
            
            result = crew.kickoff()
            return {"insights": result}
            
        except Exception as e:
            raise Exception(f"Error generating insights: {str(e)}") 