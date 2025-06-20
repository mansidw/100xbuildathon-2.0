import os
from peopledatalabs import PDLPY
import traceback

class PeoplesApi:
    def __init__(self):
        self.client = PDLPY(
            api_key=os.getenv('PEOPLES_API_KEY')
        )

    def fetch_peoples_data(self,elastic_query):
        """
        Fetches Peoples data from People Data Labs
        """
        print("API key ", os.getenv('PEOPLES_API_KEY'))
        
        PARAMS = {
            "query": elastic_query,
            "limit": 1000,  # Adjust limit as needed
            "pretty": True,
        }
        
        # Pass the parameters object to the Person Search API
        try:
            response = self.client.person.search(**PARAMS).json()
            
            if response.get('status') == 200:
                data = response.get('data', [])
                if not data:
                    return {"message": "No data found for the given query."}
                print("Data fetched successfully - ", data)
                return data
            else:
                raise ValueError(f"Error fetching data: {response}")
        except Exception as e:
            tb_str = traceback.format_exc()
            print(f"Error fetching data from People Data Labs: {e}\n{tb_str}")
            return {"error": f"API Error: {e}", "traceback": tb_str}
            



            