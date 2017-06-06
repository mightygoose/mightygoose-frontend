/* copy files */
require('file-loader?name=../../index.html.js!application.html');
require('file-loader?name=../../item_og_tags.html.js!components/og_tags/item.html');
require('file-loader?name=../../item_jsonld.html.js!components/jsonld/jsonld.html');
require('file-loader?name=../../random_post.html.js!components/random_post/random_post.html');
require('file-loader?name=../../post.html.js!components/post/post.html');


require('document-register-element');

require('components/preloader/preloader');

require('components/welcome_page_controller/welcome_page_controller');
require('components/posts_gallery_controller/posts_gallery_controller');
require('components/post/post_thumb');
require('components/lazy_image/lazy_image');

