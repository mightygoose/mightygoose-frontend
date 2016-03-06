const icon_font = require("icons-loader");
const style_inject = require("style-inject");

const styles = require('./index.styl');

const icons_map = {
  logo: require('./svg/logo.svg')
}

style_inject(icon_font.css);
style_inject(Object.keys(icons_map).map((value) => `
  .mg-icon.icon-${value}:before {
    content: '${icons_map[value].unicode}'
  }
`).join(''));

module.exports = icons_map
