/* copy files */
require('file?name=../../index.html.js!babel?presets[]=es2015&plugins[]=transform-runtime!template-string!application.html');
require('file?name=../../item_og_tags.html.js!babel?presets[]=es2015&plugins[]=transform-runtime!template-string!components/og_tags/item.html');
require('file?name=../../item_jsonld.html.js!babel?presets[]=es2015&plugins[]=transform-runtime!template-string!components/jsonld/jsonld.html');
require('file?name=../../random_post.html.js!babel?presets[]=es2015&plugins[]=transform-runtime!template-string!components/random_post/random_post.html');
require('file?name=../../post.html.js!babel?presets[]=es2015&plugins[]=transform-runtime!template-string!components/post/post.html');

/* fonts */
require("icons");

/* polyfills */
require('document-register-element');

/* components */
require('components/main/main');

/* lazy load styles */
require('components/lazy_load/lazy_load');

/* mobile events */
require('tocca');

require.ensure([], () => {
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
  require('components/tracklist/tracklist');
  require('components/preloader/preloader');
  require('components/embed_container/embed_container');
  require('components/share_button/share_button');
  require('components/autocomplete/autocomplete');
  require('components/deezer-widget/deezer-widget');
  require('components/itunes_widget/itunes_widget');
  require('components/login_bar/login_bar');
})

