/* copy files */
require('file?name=../../index.html.js!babel?presets[]=es2015&plugins[]=transform-runtime!template-string!application.html');
require('file?name=../../item_og_tags.html.js!babel?presets[]=es2015&plugins[]=transform-runtime!template-string!components/og_tags/item.html');

/* iconic fonts */
require("icons");

/* google fonts */
const web_font = require('webfontloader');
web_font.load({
  google: {
    families: ['Roboto:300,400', 'Roboto+Condensed:700']
  }
});

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
  require('components/embed_container/embed_container');
  require('components/share_button/share_button');
})

