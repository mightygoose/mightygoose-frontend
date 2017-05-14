const BaseController = require('ascesis').BaseController;
const Router = require('router').Router;
//const Delegate = require('dom-delegate');

const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./posts_gallery_controller.html');
//const styles = require('./posts_gallery_controller.styl');


class PostsGalleryController extends BaseController {

  connectedCallback(){
    super.connectedCallback();
    console.log(23123);
    this.load_posts().then((results) => {
      this.html(template({
        posts: results,
        each(list, tpl){
          return list.reduce((accum, item) => accum.concat(tpl(item)), "");
        },
      }))
    });
  }

  load_posts(params){
    return fetch("/api/search/best_posts").then(response => response.json());
    //.then((result) => {
      //console.log(result);
    //});
  }

  //attributeChangedCallback(name, prev, value){
    //super.attributeChangedCallback();

    //switch(name){
      //case 'tag':
        //break;
    //}
  //}
  //static get observedAttributes() {
    //return ['tag'];
  //}
  //get router(){
    //this._router || (this._router = new Router({ routes: this.routes }));
    //return this._router;
  //}
  //get routes(){
    //let self = this;
    //return {
      //'/'(path){
        //console.log(12312312312312);
        ////self.html(template({}));
        ////self.classList.remove('with-post');
      //},
    //}
  //}
}

module.exports = customElements.define('posts-gallery-controller', PostsGalleryController);
