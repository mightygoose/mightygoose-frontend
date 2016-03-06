/* copy files */
require('file?name=../../[name].[ext]!index.html');

require('file?name=../css/[name].[ext]!css/animation.css');
require('file?name=../css/[name].[ext]!css/fontello.css');

require('file?name=../font/[name].[ext]!font/fontello.eot');
require('file?name=../font/[name].[ext]!font/fontello.svg');
require('file?name=../font/[name].[ext]!font/fontello.ttf');
require('file?name=../font/[name].[ext]!font/fontello.woff');
/**/

/* fonts */
var icons = require("icons");

/* polyfills */
require('document-register-element');

/* components */
require('components/main/main');
require('components/short_stat/short_stat');
require('components/random_post/random_post');
require('components/search_posts/search_posts');
require('components/post/post');
require('components/posts_controller/posts_controller');
require('components/tag_form/tag_form');
require('components/tag_form/count_filter');
require('components/tag_form/query_filter');
require('components/mixcloud_controller/mixcloud_controller');
require('components/mixcloud_tracklist/mixcloud_tracklist');

