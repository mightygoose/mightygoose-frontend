from pyquery import PyQuery as pq

import sys
import json
import pdb
import re

import unicodedata as ud

def multiple_replace(dict, text):
  # Create a regular expression  from the dictionary keys
  regex = re.compile("(%s)" % "|".join(map(re.escape, dict.keys())))

  # For each match, look-up corresponding value in dictionary
  return regex.sub(lambda mo: dict[mo.string[mo.start():mo.end()]], text)



content = ""
for line in sys.stdin:
    content += line

data = json.loads(content)

bad_items = []
has_tracklist = []

filtered_items = []

for item in data:
    item['badges'] = []
    title = item['title'].encode('utf-8').strip()
    item_content = item['content'].encode('utf-8').strip()
    item_comments = map(lambda x: x.encode('utf-8').strip(), item['comments'])
    d = pq(item_content)

    #restore title
    if(title is ''):
        title = d('h3.post-title').text()
    if(title is ''):
        bad_items.append(item)
        continue
    #else:
        #filtered_items.append(item)

    #update images
    item['images'] = filter(None, map(lambda x: x.attrib.get('src', None), d('.post-body img')))
    if(len(item['images']) is 0):
        item['badges'].append('no-image')

    #decorate embed
    item['embed'] = map(lambda x: x.outerHtml(), d('.post-body object, .post-body iframe').items())
    if(len(item['embed']) > 0):
        item['has_embed'] = True


    #check links
    trust_bases = [
        "zippyshare",
        "mediafire",
        "mega.nz",
        "rusfolder.com",
        "myupload.dk",
        "uloz.to",
        "uploaded.net",
        "yadi.sk",
        "copy.com",
        "nitroflare.com",
        "gigasize.com",
        "filefactory.com",
        "turbobit.net",
        "soundcloud.com"
    ]
    for base in trust_bases:
        if base in item_content:
            item['badges'].append('link')
            item['badges'].append('link-in-post')
            break
        if base in ''.join(item_comments):
            item['badges'].append('link')
            item['badges'].append('link-in-comments')
            break

    #update tags
    deletion_map = [
            "^[-|#|=|+|.]{1,}", "[-|#|=|+]{1,}$",
            "^\*+", "\*+$",
            "(?i)genre: ", "(?i)label: ", "(?i)country: ",
            "[^\w -]",
            "[", "]"

    ]
    item['tags'] = [re.sub('|'.join(deletion_map), '', tag) for tag in item['tags'].keys()]


    #check tracklist
    if(re.search("disc 2", item_content)):
        item['badges'].append('multiple-discs')

    if(re.search("(?i)tracklist", item_content) or re.search("(?i)disc 2", item_content)):
        item['badges'].append('has-tracklist')
        has_tracklist.append(item)


    #remove comments
    item['comments'] = []

    #append
    filtered_items.append(item)


    #sys.stdin = open('/dev/tty')
    #pdb.set_trace()



print(json.dumps(filtered_items))
#print(len(has_tracklist))
#print(len(filtered_items))
#print(len(bad_items))
#print(len(data))
