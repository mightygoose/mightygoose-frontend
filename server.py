import tornado.ioloop
import tornado.web
import tornado.options
from tornado.log import enable_pretty_logging

import os
import re
import sys
import logging
from json import loads
from json import dumps

import pdb

from random import randint

from hubstorage import HubstorageClient

# PATHS
CURRENT_PATH  = os.path.dirname(sys.argv[0])
FRONTEND_PATH = os.path.join(CURRENT_PATH, 'frontend')

ALLOWED_HOSTINGS = ['zippyshare', 'mediafire', 'mega.nz']

#hubstorage collection
#hc = HubstorageClient(auth=os.environ['STORAGE_KEY'])
#collection = [item for item in hc.get_project(os.environ['PROJECT_ID']).items.list()]
collection = []

def get_good():
    return filter(
            lambda item: any(
                host in item['content'] for host in ALLOWED_HOSTINGS
            ),
            collection
    )

def get_tags():
    tags = {}
    for item in get_good():
        for tag in item['tags']:
            tag_encoded = tag.encode('utf-8')
            tags[tag_encoded] = tags.get(tag_encoded, 0) + 1
    return tags

class BlogPostsHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(dumps(get_good()))

    def post(self):
        tags = loads(self.request.body)

        if(len(tags) == 0):
            self.write("[]")
            return

        data = filter(
                lambda item: any( tag in item['tags'] for tag in tags),
                get_good()
        )

        self.write(dumps(data))

class BlogPostHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("get handler")

class EvaluatePostHandler(tornado.web.RequestHandler):
    def post(self, id):
        collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {
                    "$set": {
                        "marks": loads(self.request.body)
                    }
                }
        )
        self.write("true")

class RandomBlogPostHandler(tornado.web.RequestHandler):
    def get(self):
        good_posts = get_good()
        random_post = [good_posts[randint(0, len(good_posts) - 1)]]
        self.write(dumps(random_post))

class TagsHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(dumps(get_tags()))

class StatHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(dumps({
            "tags": get_tags(),
            "count": len(get_good())
        }))

def serve():
    return tornado.web.Application([
        (r"/api/posts", BlogPostsHandler),
        (r"/api/post/random", RandomBlogPostHandler),
        (r"/api/post/([0-9]+)", BlogPostHandler),
        (r"/api/evaluate/(.+)", EvaluatePostHandler),
        (r"/api/tags", TagsHandler),
        (r"/api/stat", StatHandler),
        (r'/(.*)', tornado.web.StaticFileHandler, {'path': FRONTEND_PATH})
    ], autoreload=True, debug=True)

if __name__ == "__main__":
    enable_pretty_logging()
    app = serve()
    app.listen(os.environ.get("PORT", 8888))
    logging.info("starting torando web server")
    tornado.ioloop.IOLoop.current().start()
