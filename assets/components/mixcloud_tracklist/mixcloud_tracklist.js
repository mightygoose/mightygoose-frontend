const BaseComponent = require('ascesis').BaseComponent;
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./mixcloud_tracklist.html');
const styles = require('./mixcloud_tracklist.styl');
const _ = require('lodash');

class MixcloudTracklist extends BaseComponent {
  render(data){
    console.log(data);
    this.innerHTML = template({
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
        return _.map(data.cloudcast.sections, (track) => {
          return (track.artist && track.title) ? tpl(track) : fallback_tpl(track);
        }).join("")
      }
    });
  }
  create(){
    console.log('mixcloud tracklist created');
    //this.innerHTML = template();
  }
  attach(){}
  detach(){}
  attributeChange(name, previousValue, value){}
}

module.exports = document.registerElement('mixcloud-tracklist', MixcloudTracklist);
