const BaseComponent = require('ascesis').BaseComponent;
const template = require('./mixcloud_tracklist.html');
const styles = require('./mixcloud_tracklist.styl');

const _ = require('lodash');
const jsonp = require('browser-jsonp');
const btc = require('bloom-text-compare');
const Delegate = require('dom-delegate');

class MixcloudTracklist extends BaseComponent {
  render(data){
    let self = this;
    let tracks = _.map(
      data.cloudcast.sections,
      (track, index) => _.assign({}, {index}, track)
    );

    _.each(tracks, (track) => {
      jsonp({
        url: `https://itunes.apple.com/search?term=${track.artist.replace(/ /ig, '+')}+${track.title.replace(/ /ig, '+')}`,
        data: {
          entity: 'song'
        },
        success(data){
          let itunes_track = _.first(data.results);
          if(!itunes_track){ return; }
          let hash1 = btc.hash(itunes_track.artistName.split(' ').concat(itunes_track.trackName.split(' ')));
          let hash2 = btc.hash(track.artist.split(' ').concat(track.title.split(' ')));
          let similarity = btc.compare(hash1, hash2);
          if(similarity === 0){ return; }
          let container = self.querySelector(`.preview-wrapper[data-index='${track.index}']`);

          //preview-player should be a component
          container.innerHTML = `
            <span class="play-pause-button-wrapper">
                <span class="play-pause-button mg-icon icon-play">
                    <audio src="${itunes_track.previewUrl}" preload="none"></audio>
                </span>
            </span>
          `;
        }
      });
    });

    this.html(template({
      image: data.cloudcast.pictures.mobile_player_full,
      title: data.cloudcast.title,
      format_position(seconds){
        var secs = Math.round(seconds);
        var hours = Math.floor(secs / (60 * 60));

        var divisor_for_minutes = secs % (60 * 60);
        var minutes = Math.floor(divisor_for_minutes / 60);

        var divisor_for_seconds = divisor_for_minutes % 60;
        var seconds = Math.ceil(divisor_for_seconds);

        return [
          hours < 10 ? `0${hours}` : `${hours}`,
          minutes < 10 ? `0${minutes}` : `${minutes}`,
          seconds < 10 ? `0${seconds}` : `${seconds}`,
        ].join(':');
      },
      each_artist(tpl){
        return _.map(data.cloudcast.featuring_artist_list, (artist) => tpl(artist)).join("");
      },
      each_track(tpl, fallback_tpl){
        return _.map(tracks, (track) => {
          return (track.artist && track.title) ? tpl(track) : fallback_tpl(track);
        }).join("")
      }
    }));
  }
  connectedCallback(){
    super.connectedCallback();

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
}

module.exports = customElements.define('mixcloud-tracklist', MixcloudTracklist);
