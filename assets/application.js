/* copy files */
require('file?name=../../index.[ext]!application.html');

/* fonts */
require("icons");

/* polyfills */
require('document-register-element');

/* components */
require('components/main/main');

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
})

