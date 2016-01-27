import tornado.ioloop
import tornado.web
import tornado.gen
import tornado.options
import tornado.httpclient
from tornado.log import enable_pretty_logging

import os
import re
import sys
import logging
import base64

import sys
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))
from store import Store

from json import loads
from json import dumps

import pdb

from random import randint

from hubstorage import HubstorageClient

# PATHS
CURRENT_PATH  = os.path.dirname(os.path.abspath(__file__))
FRONTEND_PATH = os.path.join(CURRENT_PATH, 'frontend')

ALLOWED_HOSTINGS = ['zippyshare', 'mediafire', 'mega.nz']

#hubstorage collection
hc = HubstorageClient(auth=os.environ['STORAGE_KEY'])
collection = []

store = Store()

def basic_auth(auth_func=lambda *args, **kwargs: True, after_login_func=lambda *args, **kwargs: None, realm='Restricted'):
    def basic_auth_decorator(handler_class):
        def wrap_execute(handler_execute):
            def require_basic_auth(handler, kwargs):
                def create_auth_header():
                    handler.set_status(401)
                    handler.set_header('WWW-Authenticate', 'Basic realm=%s' % realm)
                    handler._transforms = []
                    handler.finish()

                auth_header = handler.request.headers.get('Authorization')

                if auth_header is None or not auth_header.startswith('Basic '):
                    create_auth_header()
                else:
                    auth_decoded = base64.decodestring(auth_header[6:])
                    user, pwd = auth_decoded.split(':', 2)

                    if auth_func(user, pwd):
                        after_login_func(handler, kwargs, user, pwd)
                    else:
                        create_auth_header()

            def _execute(self, transforms, *args, **kwargs):
                require_basic_auth(self, kwargs)
                return handler_execute(self, transforms, *args, **kwargs)

            return _execute

        handler_class._execute = wrap_execute(handler_class._execute)
        return handler_class
    return basic_auth_decorator

def check_credentials(user, pwd):
    return user == os.environ['BASE_AUTH_USERNAME'] and pwd == os.environ['BASE_AUTH_PASSWORD']


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

@basic_auth(check_credentials)
class BaseAuthExampleHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(dumps(["test"]))

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
    @tornado.gen.coroutine
    def get(self):
        random_post = yield store.get_random()
        self.write(dumps(random_post))

class TagsHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(dumps(get_tags()))

class StatHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(dumps({
            "count": len(store.collection)
        }))

class UpdateHandler(tornado.web.RequestHandler):
    @tornado.gen.coroutine
    def get(self):
        yield store.update()
        self.write(dumps({
            "status": "ok",
            "new_count": len(store.collection)
        }))

def serve():
    return tornado.web.Application([
        (r"/api/posts", BlogPostsHandler),
        (r"/api/post/random", RandomBlogPostHandler),
        (r"/api/post/([0-9]+)", BlogPostHandler),
        (r"/api/evaluate/(.+)", EvaluatePostHandler),
        (r"/api/tags", TagsHandler),
        (r"/api/stat", StatHandler),
        (r"/update", UpdateHandler),
        (r'/(.*)', tornado.web.StaticFileHandler, {'path': FRONTEND_PATH, "default_filename": "index.html"})
    ], autoreload=True, debug=True)

if __name__ == "__main__":
    enable_pretty_logging()
    store.update()
    app = serve()
    app.listen(os.environ.get("PORT", 8888))
    logging.info("starting torando web server")
    tornado.ioloop.IOLoop.current().start()
