import pdb

import logging
import os
import json
import urllib

from random import randint

from tornado import gen
from tornado import httpclient

DATA_HOST = "https://storage.scrapinghub.com"
PROJECT_ID = os.environ['PROJECT_ID']
API_KEY = os.environ['STORAGE_KEY']

CONNECT_TIMEOUT = 200.0
REQUEST_TIMEOUT = 200.0

class Store():

    collection = []

    @gen.coroutine
    def update(self):
        logging.info("updating statistic")
        http_client = httpclient.AsyncHTTPClient()
        try:
            url = "{0}/items/{1}?{2}&filterany={3}".format(
                DATA_HOST,
                PROJECT_ID,
                urllib.urlencode({
                    "apikey": API_KEY,
                    "format": "json",
                    "meta": ["_key"],
                    "nodata": "1"
                }, True),
                "%5B%22content%22%2C%22matches%22%2C%5B%22(zippyshare|mediafire|mega\.nz)%22%5D%5D"
            )
            request = httpclient.HTTPRequest(url=url, connect_timeout=CONNECT_TIMEOUT, request_timeout=REQUEST_TIMEOUT)
            response = yield http_client.fetch(request)
            data = json.loads(response.body)
            self.collection = map(lambda x: x.get('_key'), data)
            logging.info("statistic updated")
            raise gen.Return(True)
        except httpclient.HTTPError as e:
            print("Http Error: " + str(e))

    @gen.coroutine
    def get_random(self):
        http_client = httpclient.AsyncHTTPClient()
        random_post_key = self.collection[randint(0, len(self.collection) - 1)]

        url = "{0}/items/{1}?{2}".format(
            DATA_HOST,
            random_post_key,
            urllib.urlencode({
                "apikey": API_KEY,
                "format": "json",
                "meta": ["_key"]
            }, True)
        )
        response = yield http_client.fetch(url)
        raise gen.Return(json.loads(response.body))

