import re
import sys
import json
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

content = ""
for line in sys.stdin:
    content += line

item = json.loads(content)

title = item['title']
url = item['url']
tags = set(item['tags'])
discogs = {}
badges = item['badges']
sh_key = item['_key']
sh_type = item['_type']
embed = item['embed']
images = item['images']

if(len(item['discogs']) > 0):
    title = item['discogs']['title']
    tags = tags | set(item['discogs']['genre']) | set(item['discogs']['style'])
    discogs = {
            "resource_url": item['discogs']['resource_url'],
            "type": item['discogs']['type'],
            "id": item['discogs']['id']
    }


query_string = "INSERT INTO items(\"sh_key\",\"sh_type\",\"badges\",\"discogs\",\"embed\",\"images\",\"tags\",\"title\",\"url\") VALUES ( '{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}' );".format(
        sh_key,
        sh_type,
        json.dumps(badges),
        json.dumps(discogs),
        json.dumps(embed),
        re.sub("'", "''", json.dumps(images)),
        re.sub("'", "''", json.dumps(list(tags))),
        re.sub("'", "''", title),
        url
)


print(query_string);
