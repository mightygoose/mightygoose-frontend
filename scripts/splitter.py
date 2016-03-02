import sys
import os
import json
import pdb


content = ""
for line in sys.stdin:
    content += line

data = json.loads(content)

print('ok')


for item in data:
    filename = "items_data/{0}.json".format(item['_key'])
    print("creating ".format(filename))
    if not os.path.exists(os.path.dirname(filename)):
        try:
            os.makedirs(os.path.dirname(filename))
        except OSError as exc: # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise

    with open(filename, 'w') as file_:
        file_.write(json.dumps(item, indent=4))


print(len(data))
