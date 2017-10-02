const RouterController = require('lib/router_controller');

const template = require('./search_controller.html');
//const styles = require('./search_posts.styl');

const resultsTemplate = (scope) => scope.map((result) => `
  <div>
    <img src="${result.thumb}">
    <span>title: ${result.title}</span>
    <span>barcode: ${result.barcode.join(', ')}</span>
    <span>catno: ${result.catno}</span>
    <span>year: ${result.year}</span>
    <span>label: ${result.label.join()}</span>
    <span>format: ${result.format.join()}</span>
    <span>genre: ${result.genre.join()}</span>
  </div>
`).join('');


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

    (this.barcode !== q.barcode) && (this.barcode = q.barcode || '');
    (this.catno !== q.catno) && (this.catno = q.catno || '');
    (this.artist !== q.artist) && (this.artist = q.artist || '');
    (this.year !== q.year) && (this.year = q.year || '');
    (this.releaseTitle !== q.release_title) && (this.releaseTitle = q.release_title || '');

    if(!Object.keys(q).length){ return; }

    this.refs.$preloader.show && this.refs.$preloader.show();

    this.html('', this.refs.$results);
    fetch(`/api/search/discogs?${getQueryString(q)}`)
      .then(response => response.json())
      .then(response => response.results)
      .then(response => this.renderResults(response))
      .then(() => this.refs.$preloader.hide && this.refs.$preloader.hide())
  }

  renderResults(results = []){
    this.html(resultsTemplate(results), this.refs.$results);
    return results;
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
      '/'(q){
        self.render(q);
      },
    }
  }
}

module.exports = customElements.define('search-controller', SearchController);
