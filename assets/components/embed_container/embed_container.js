const BaseComponent = require('ascesis').BaseComponent;
const videoEmbed = require('video-embed');

class EmbedContainer extends BaseComponent {
  create(){
    console.log('embed container created');
  }
  attach(){
    var embed_url = this.getAttribute('src');
    if(embed_url && embed_url !== ''){
      this.innerHTML = `
        <div class="item-embed-content">${videoEmbed(embed_url)}</div>
      `;
      var iframe = this.querySelector('iframe');
      iframe.setAttribute('width', 320);
      iframe.setAttribute('height', 260);
    }
  }
}

module.exports = document.registerElement('embed-container', EmbedContainer);
