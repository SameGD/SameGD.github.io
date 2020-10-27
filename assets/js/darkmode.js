//Thanks to https://dev.to/ananyaneogi/create-a-dark-light-mode-switch-with-css-variables-34l8, whom I have shamelessly stolen this code from.
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {        document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('theme', 'light');
    }    
}

//Should fix flicker that happens on page load with darkmode enabled

document.addEventListener("DOMContentLoaded", function(){
  
  const toggleSwitch = document.querySelector('.darkmode input[type="checkbox"]');
  
  if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
  
  toggleSwitch.addEventListener('change', switchTheme, false);
  
});