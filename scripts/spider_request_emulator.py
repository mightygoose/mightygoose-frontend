#usage: heroku local:run python scripts/spider_request_emulator.py <sh_id>

import urllib, urllib2
import pdb
import json
import sys
import os


SH_TOKEN = os.environ["STORAGE_KEY"]
SH_KEY = sys.argv[1]
SH_URL = "https://storage.scrapinghub.com/items/{0}?apikey={1}&format=json".format(SH_KEY, SH_TOKEN)
#MIGHTYGOOSE_URL = "http://mightygoose.com/api/add_post"
MIGHTYGOOSE_URL = "http://127.0.0.1:5000/api/add_post"


#get item from storage
print "request item #{0} from storage".format(SH_KEY)
storage_req = urllib2.Request(SH_URL)
storage_response = urllib2.urlopen(storage_req)
storage_response_body = storage_response.read()


#prepare mg request
print "preparing mg request"
item = json.loads(storage_response_body)[0]

values = {
    "title": item['title'].encode("utf-8"),
    "badges": item['badges'],
    "url": item['url'],
    "tags": json.dumps(item['tags']),
    "sh_key": item['scrapinghub_id'],
    "crawler_name": item['crawler_name'],
    "embed": json.dumps(item['embed']),
    "images": json.dumps(item['images']),
    "content": json.dumps(item['content']),
    "comments": json.dumps(item['comments'])
}
headers = {}

print "sending mg request"
data = urllib.urlencode(values)
req = urllib2.Request(MIGHTYGOOSE_URL, data, headers)
response = urllib2.urlopen(req)
response_body = response.read()

try:
    [status, badges] = json.loads(response_body)
    item["status"] = status
    item["badges"] = badges
except:
    item["status"] = "mightygoose_bad_response"

print(json.dumps(item, indent=4))
