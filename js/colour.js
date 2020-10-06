function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var colorman = getRandomColor();

var css = `.colorthis { background-color: ${colorman} !important; }
.bg-colorthis { background-color: ${colorman + '1A'} !important; }
.txt-colorthis { color: ${colorman} !important; }
.bg-hover-colorthis:hover .bg-colorthis { background-color: ${colorman} !important; }
.bg-hover-colorthis:hover { background-color: ${colorman + '1A'} !important; }`;

var style = document.createElement('style');

if (style.styleSheet) {
    style.styleSheet.cssText = css;
} else {
    style.appendChild(document.createTextNode(css));
}

document.getElementsByTagName('head')[0].appendChild(style);