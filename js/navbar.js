function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var colorman = getRandomColor();

//Colour Navbar bottom + 'Graphics Demo'

var navbar = document.getElementById('navbar');

//navbar.style.borderBottomColor = colorman;

navbar.style.boxShadow = `inset 0px 3px 0px 0px ${colorman}`;

//Colour a tags

var css = `a:hover { color: ${colorman} !important; } .accent-bg { background-color: ${colorman + '1A'}; } .accent-top { border-top-color: ${colorman}; } .accent-bottom { border-bottom-color: ${colorman}; } .accent-left { border-left-color: ${colorman}; } .accent-right { border-right-color: ${colorman};} .accent-text { color: ${colorman} !important; } .accent-hover:hover { background-color: ${colorman + '0D'}; } .tabs .tab:hover { background-color: ${colorman + '0D'} !important; } .tabs .indicator { background-color: ${colorman} !important; } .tabs .tab a:focus { background-color: ${colorman + '0D'} !important;} .tabs .tab .active { color: ${colorman} !important;} .topic-bg { background: linear-gradient(180deg, ${colorman + '1A'} 65%, #00000000 0%) }`;

//rip box shadow borders
//var css = `a:hover { color: ${colorman}; } .colourme { background-color: ${colorman}; } .accent-top { box-shadow: inset 0px 4px 0px 0px ${colorman}; } .accent-bottom { box-shadow: inset 0px -4px 0px 0px ${colorman}; } .accent-left { box-shadow: inset 4px 0px 0px 0px ${colorman}; } .accent-right { box-shadow: inset -4px 0px 0px 0px ${colorman}; }`;

var style = document.createElement('style');

if (style.styleSheet) {
    style.styleSheet.cssText = css;
} else {``
    style.appendChild(document.createTextNode(css));
}

document.getElementsByTagName('head')[0].appendChild(style);