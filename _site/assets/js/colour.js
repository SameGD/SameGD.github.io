function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var colorman = getRandomColor();

document.documentElement.style.setProperty("--primary", colorman);
document.documentElement.style.setProperty("--primary-light", colorman + "1A");