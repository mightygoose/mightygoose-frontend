const BaseComponent = require('ascesis').BaseComponent;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./itunes_widget.html');
const styles = require('./itunes_widget.styl');

const jsonp = require('browser-jsonp');
const _ = require('lodash');
const Delegate = require('dom-delegate');

class ItunesWidget extends BaseComponent {
  render(data){
    this.html(template({
      each_track(tpl){
        return _.reduce(
          _.filter(data.results, {wrapperType: "track"}),
          (accum, track) => accum.concat(tpl(track)),
          ""
        );
      }
    }));
  }
  create(){
    console.log('itunes widget created');
    let self = this;
    let album_id = this.getAttribute('album-id');
    jsonp({
      url: 'https://itunes.apple.com/lookup',
      data: {
        id: album_id,
        entity: 'song'
      },
      success(data){
        self.render(data);
      }
    });

    let delegate = new Delegate(this);
    delegate.on('click', '.play-pause-button', (event, target) => {
      let audio = target.querySelector('audio');
      audio[audio.paused ? 'play' : 'pause']();
    });
    delegate.on('playing', '.play-pause-button', (event, target) => {
      target.classList.toggle('icon-play');
      target.classList.toggle('icon-pause');
    }, true);
    delegate.on('pause', '.play-pause-button', (event, target) => {
      target.classList.toggle('icon-play');
      target.classList.toggle('icon-pause');
    }, true);
  }
  attach(){}
}

module.exports = document.registerElement('itunes-widget', ItunesWidget);
