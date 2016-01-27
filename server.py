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


@tornado.gen.coroutine
def update_data():
    global collection
    logging.info("updating statisics")
    http_client = tornado.httpclient.AsyncHTTPClient()
    try:
        request = tornado.httpclient.HTTPRequest(url="https://storage.scrapinghub.com/items/{0}?apikey={1}&format=json&meta=_key&filterany=%5B%22content%22%2C%22matches%22%2C%5B%22(zippyshare|mediafire|mega\.nz)%22%5D%5D&meta=_ts&nodata=1".format(os.environ['PROJECT_ID'], os.environ['STORAGE_KEY']), connect_timeout=200.0, request_timeout=200.0)
        response = yield http_client.fetch(request)
        data = loads(response.body)
        collection = map(lambda x: x.get('_key'), data)
    except tornado.httpclient.HTTPError as e:
        print("Http Error: " + str(e))
    except Exception as e:
        print("Error: " + str(e))
    logging.info("statisics updated")

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
        http_client = tornado.httpclient.AsyncHTTPClient()
        random_post_key = collection[randint(0, len(collection) - 1)]

        url = "https://storage.scrapinghub.com/items/{0}?apikey={1}&format=json&meta=_key&meta=_ts".format(random_post_key, os.environ['STORAGE_KEY'])
        request = tornado.httpclient.HTTPRequest(url=url, connect_timeout=200.0, request_timeout=200.0)
        response = yield http_client.fetch(url)
        random_post = loads(response.body)
        self.write(dumps(random_post))

class TagsHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(dumps(get_tags()))

class StatHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(dumps({
            #"tags": get_tags(),
            "count": len(collection)
        }))

class UpdateHandler(tornado.web.RequestHandler):
    def get(self):
        update_data()
        self.write('ok. new total count: {0}'.format(len(collection)))

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
    update_data()
    app = serve()
    app.listen(os.environ.get("PORT", 8888))
    logging.info("starting torando web server")
    tornado.ioloop.IOLoop.current().start()
