import os
from peopledatalabs import PDLPY

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
            print("Response here", response)
            if response.get('status') == 200:
                data = response.get('data', [])
                if not data:
                    return {"message": "No data found for the given query."}
                print("Data fetched successfully - ", data)
                return data
            else:
                raise ValueError(f"Error fetching data")
        except Exception as e:
            print(f"Error fetching data: {e}")
            return {"error": str(e)}
            



            