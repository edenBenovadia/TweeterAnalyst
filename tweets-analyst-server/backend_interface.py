import requests, json
from typing import Optional, Dict, List

##server returns warining we don't want to output this to our nodeJS so I emit the warning (not a good practice - only for development proccess)
import warnings
warnings.filterwarnings("ignore")

import sys

#encoding to align with the output encoding
sys.stdout.reconfigure(encoding='utf-8')

USERNAME = 'Eden.bo@larium.ai'
PASSWORD = 'xVsG2%j'

BACKEND_URL = 'https://mars.larium.ai:8002'


class BackendInterface():

    def __init__(self, base_url: str, username: str, password: str) -> None:
        self.base_url = base_url
        self.headers = self.get_headers(username=username, password=password)

    # Get bearer token that is valid for 30 minutes for a specific user
    def get_headers(self, username: str, password: str) -> Optional[Dict[str, str]]:
        token_route = '/token/'
        params = {
            'username': username,
            'password': password,
            'grant_type': 'password'
        }
        response = requests.post(url=self.base_url + token_route, data=params, timeout=6.03, verify=False)
        if response.status_code == 200:
            bearer_token = json.loads(response.text).get('access_token')
        else:
            print('Invalid credentials')
            return None
        return {'Authorization': f'Bearer {bearer_token}'}


    # @param from_date, until_day: '%Y-%m-%d' (from_date included, until_day not included)
    def get_tweets_metadata_ids(self, ticker: str, from_date: str, until_day: str) -> List[str]:
        ids_route = '/tweets/metadata/ids/'
        ids_params = {
            'larium_relevance': True,
            'tags': ticker,
            'from_day': from_date,
            'until_day': until_day
        }

        response = requests.get(url=self.base_url + ids_route, params=ids_params, headers=self.headers, verify=False)
        ids = json.loads(response.text)

        return ids or []

    # @return: {
    #           "tweets": [list of tweets that exist in db],
    #           "missing_ids": [list of tweets ids that missing in db]
    #          }
    def get_tweets_by_ids(self, ids: List[str]) -> List[Dict]:
        tweets_route = '/tweets/'
        tweets_params = {
            'tweet_ids': ids
        }
        response = requests.get(url=self.base_url + tweets_route, params=tweets_params, headers=self.headers, verify=False)
        tweets = response.json()
        return tweets

    # @param from_date, until_day: '%Y-%m-%d' (from_date included, until_day not included)
    def get_tweets_per_company(self, ticker: str, from_date: str, until_day: str) -> List[Dict]:
            ids = self.get_tweets_metadata_ids(ticker=ticker, from_date=from_date, until_day=until_day)
            if ids==[]:
                return []
            tweets = self.get_tweets_by_ids(ids=ids)
            return sorted(tweets['tweets'], key=(lambda tweet: tweet['tweet_created_at']))


response = BackendInterface(BACKEND_URL, USERNAME, PASSWORD).get_tweets_per_company(sys.argv[1], sys.argv[2], sys.argv[3])
jsonResponse = json.dumps(response)
print(jsonResponse)
sys.stdout.flush()
sys.stdout.close()


# Example
# BackendInterface(BACKEND_URL, USERNAME, PASSWORD).get_tweets_per_company('AMZN', '2021-12-05', '2021-12-15')
