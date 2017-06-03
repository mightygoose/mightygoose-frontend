/* copy files */
require('file-loader?name=../../index.html.js!application.html');
require('file-loader?name=../../item_og_tags.html.js!components/og_tags/item.html');
require('file-loader?name=../../item_jsonld.html.js!components/jsonld/jsonld.html');
require('file-loader?name=../../random_post.html.js!components/random_post/random_post.html');
require('file-loader?name=../../post.html.js!components/post/post.html');


require('document-register-element');


//require('components/short_stat/short_stat');
//require('components/random_post/random_post');
//require('components/search_posts/search_posts');
//require('components/post/post');
//require('components/posts_controller/posts_controller');
//require('components/tag_form/tag_form');
//require('components/tag_form/count_filter');
//require('components/tag_form/query_filter');
//require('components/mixcloud_controller/mixcloud_controller');
//require('components/mixcloud_tracklist/mixcloud_tracklist');
//require('components/tracklist/tracklist');
require('components/preloader/preloader');
//require('components/embed_container/embed_container');
//require('components/share_button/share_button');
//require('components/autocomplete/autocomplete');
//require('components/deezer-widget/deezer-widget');
//require('components/itunes_widget/itunes_widget');
//require('components/login_bar/login_bar');
//require('components/user_profile_controller/user_profile_controller');

require('components/welcome_page_controller/welcome_page_controller');
require('components/posts_gallery_controller/posts_gallery_controller');
require('components/post/post_thumb');
require('components/lazy_image/lazy_image');

