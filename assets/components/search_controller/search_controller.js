const RouterController = require('lib/router_controller');

const template = require('./search_controller.html');
const styles = require('./search_controller.styl');

const resultTemplate = require('./search_result.html');
const resultsTemplate = (scope) => scope.map(resultTemplate).join('');

const releaseTemplate = require('./release.html');


const getQueryString = (params) => {
  var esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&');
}

class SearchController extends RouterController {
  connectedCallback(){
    super.connectedCallback();

    this.on('submit', `[ref="form"]`, (event) => {
      event.preventDefault();

      const value = Object.assign({},
        this.barcode ? { barcode: this.barcode, } : {},
        this.catno ? { catno: this.catno, } : {},
        this.artist ? { artist: this.artist, } : {},
        this.year ? { year: this.year, } : {},
        this.releaseTitle ? { release_title: this.releaseTitle, } : {},
      );

      this.router.setParams(value);
    });
  }

  render(q){

    if(!this.childNodes.length){
      this.html(template(q));

      this.refs = {
        $form: this.querySelector('[ref="form"]'),
        $barcode: this.querySelector('[ref="barcode"]'),
        $catno: this.querySelector('[ref="catno"]'),
        $artist: this.querySelector('[ref="artist"]'),
        $year: this.querySelector('[ref="year"]'),
        $releaseTitle: this.querySelector('[ref="release_title"]'),
        $preloader: this.querySelector('[ref="preloader"]'),
        $results: this.querySelector('[ref="results"]')
      }
    }
    this.html('', this.refs.$results);
  }

  applyParams(q){

    (this.barcode !== q.barcode) && (this.barcode = q.barcode || '');
    (this.catno !== q.catno) && (this.catno = q.catno || '');
    (this.artist !== q.artist) && (this.artist = q.artist || '');
    (this.year !== q.year) && (this.year = q.year || '');
    (this.releaseTitle !== q.release_title) && (this.releaseTitle = q.release_title || '');

    if(!Object.keys(q).length){ return; }

    this.refs.$preloader.show && this.refs.$preloader.show();

    fetch(`/api/search/discogs?${getQueryString(q)}`)
      .then(response => response.json())
      .then(response => response.results)
      .then(results => {
        this.html(resultsTemplate(results), this.refs.$results);
        this.refs.$results.scrollIntoView();
        return results;
      })
      .then(results => {
        if(!results.length){
        this.html(`<span class="no-results">no results</span>`, this.refs.$results);
        }
      })
      .then(() => this.refs.$preloader.hide && this.refs.$preloader.hide())
  }

  renderItem(id){
    this.refs.$preloader.show && this.refs.$preloader.show();
    fetch(`/api/discogs_info/releases/${id}`)
      .then(response => response.json())
      .then((data) => {
        this.html(releaseTemplate(data), this.refs.$results);
        this.refs.$results.scrollIntoView();
      })
      .then(() => this.refs.$preloader.hide && this.refs.$preloader.hide())
  }

  set barcode(value){
    this.refs.$barcode.value = value;
  }

  get barcode(){
    return this.refs.$barcode.value;
  }

  set catno(value){
    this.refs.$catno.value = value;
  }

  get catno(){
    return this.refs.$catno.value;
  }

  set artist(value){
    this.refs.$artist.value = value;
  }

  get artist(){
    return this.refs.$artist.value;
  }

  set year(value){
    this.refs.$year.value = value;
  }

  get year(){
    return this.refs.$year.value;
  }

  set releaseTitle(value){
    this.refs.$releaseTitle.value = value;
  }

  get releaseTitle(){
    return this.refs.$releaseTitle.value;
  }

  get routes(){
    let self = this;
    return {
      '*'(path, q){
        self.render(q);
        self.applyParams(q);
      },
      '/discogs/releases/:id'(id){
        self.renderItem(id);
      },
    }
  }
}

module.exports = customElements.define('search-controller', SearchController);
