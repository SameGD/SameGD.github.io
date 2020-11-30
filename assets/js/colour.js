function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function adjust(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

var genColor = getRandomColor();

document.documentElement.style.setProperty("--primary", genColor);
document.documentElement.style.setProperty("--primary-select", adjust(genColor, -20));

document.documentElement.style.setProperty("--primary-light", genColor + "1A");
document.documentElement.style.setProperty("--primary-light-select", adjust(genColor, -20) + "1A");

document.documentElement.style.setProperty("--primary-dark", adjust(genColor, -60));
document.documentElement.style.setProperty("--primary-dark-select", adjust(genColor, -40));