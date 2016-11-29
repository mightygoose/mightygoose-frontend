const BaseComponent = require('ascesis').BaseComponent;
const styles = require('./share_button.styl');

class ShareButton extends BaseComponent {
  get links(){
    let encode = (str) => window.encodeURIComponent(str);
    return {
      fb: (url) => `http://www.facebook.com/sharer.php?u=${encode(url)}`,
      vk: (url, title, description, image) => [`http://vkontakte.ru/share.php?url=${encode(url)}`,
        `title=${encode(title)}`,
        `description=${encode(description)}`,
        `image=${encode(image)}`].join('&'),
      tw: (url, title) => [
        `http://twitter.com/intent/tweet`,
        `text=${encode(title)}&url=${encode(url)}`].join('?')
    }
  }
  connectedCallback(){
    super.connectedCallback();

    console.log('share button created');
    this.addEventListener('click', _ => this.share());
  }
  share(callback = () => {}){
    let url = this.getAttribute('url');
    let title = this.getAttribute('title');
    let description = this.getAttribute('description');
    let image = this.getAttribute('image');
    let network = this.getAttribute('network');
    let child_window = window.open(this.links[network](url, title, description, image),
                                   'Sharing', 'width=740,height=440'
    );

    let interval = setInterval(_ => {
      if(child_window.closed){
        clearInterval(interval);
        callback();
      }
    }, 500);
  }
}


module.exports = customElements.define('share-button', ShareButton);
