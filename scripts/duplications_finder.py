# input format:
# <item_id> <item_url>

import re
import sys
import json
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

existing_items = {}

content = ""
for line in sys.stdin:
    content += line
    [item_id, url] = line.split()

    if(existing_items.has_key(url)):
        print("items_data/{0}.json".format(item_id))
    else:
        existing_items[url] = item_id
    #print(existing_items)
