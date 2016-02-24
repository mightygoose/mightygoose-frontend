const BaseComponent = require('lib/base_component');
const template = require('babel?presets[]=es2015&plugins[]=transform-runtime!template-string!./mixcloud_tracklist.html');
const styles = require('style!css!stylus!./mixcloud_tracklist.styl');

class MixcloudTracklist extends BaseComponent {
  render(data){
    console.log(data);
    this.innerHTML = template({
      image: data.cloudcast.pictures.mobile_player_full,
      title: data.cloudcast.title,
      each_artist(tpl){
        return _.map(data.cloudcast.featuring_artist_list, (artist) => tpl(artist)).join("");
      },
      each_track(tpl){
        return _.map(data.cloudcast.sections, (track) => tpl(track)).join("");
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
