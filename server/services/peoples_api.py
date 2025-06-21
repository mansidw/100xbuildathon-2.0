import os
from peopledatalabs import PDLPY
import traceback

class PeoplesApi:
    def __init__(self):
        self.client = PDLPY(
            api_key=os.getenv('PEOPLES_API_KEY')
        )

    def fetch_peoples_data(self, elastic_query):
        """
        Fetches Peoples data from People Data Labs using an Elasticsearch query.
        """
        print("API key ", os.getenv('PEOPLES_API_KEY'))
        
        try:
            # The search method expects a dictionary for the `query` parameter.
            # Other parameters like `size` are passed as keyword arguments.
            size = elastic_query.pop('size', 10) # Default to 10 if not in query

            response = self.client.person.search(
                query=elastic_query,
                size=size,
                pretty=True
            ).json()
            
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
            



            