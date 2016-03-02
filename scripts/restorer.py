from pyquery import PyQuery as pq

import os
import sys
import json
import pdb
import re

import unicodedata as ud

def multiple_replace(dict, text):
  regex = re.compile("(%s)" % "|".join(map(re.escape, dict.keys())))
  return regex.sub(lambda mo: dict[mo.string[mo.start():mo.end()]], text)


content = ""
for line in sys.stdin:
    content += line

item = json.loads(content)


item['badges'] = []
title = item['title'].encode('utf-8').strip()
item_content = item['content'].encode('utf-8').strip()
item_comments = ''.join(map(lambda x: x.encode('utf-8').strip(), item['comments']))
d = pq(item_content)


#restore title
if(title is ''):
    title = d('h3.post-title').text()
if(title is ''):
    item['badges'].append('no-title')

item['title'] = title

#update images
item['images'] = filter(None, map(lambda x: x.attrib.get('src', None), d('.post-body img')))
if(len(item['images']) is 0):
    item['badges'].append('no-image')


#decorate embed
item['embed'] = map(lambda x: x.outerHtml(), d('.post-body object, .post-body iframe').items())
if(len(item['embed']) > 0):
    item['badges'].append('has-embed')


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
        item['badges'].append('has-link')
        item['badges'].append('link-in-post')
        break
    if base in item_comments:
        item['badges'].append('has-link')
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

if(type(item['tags']) is not list):
    item['tags'] = [re.sub('|'.join(deletion_map), '', tag) for tag in dict(item['tags']).keys()]


#check tracklist
if(re.search("(?i)disc 2", item_content)):
    item['badges'].append('multiple-discs')

if(re.search("(?i)tracklist", item_content) \
        or re.search("(?i)disc 2", item_content) \
        or re.search("(?i)tracks :", item_content) \
        or re.search("(?i)track (?i)listing", item_content)):
    item['badges'].append('has-tracklist')

if(re.search("(?i)tracklist", item_comments) \
        or re.search("(?i)disc 2", item_comments) \
        or re.search("(?i)tracks :", item_comments) \
        or re.search("(?i)track (?i)listing", item_comments)):
    item['badges'].append('has-tracklist')
    item['badges'].append('tracklist-in-comments')


print(json.dumps(item))
