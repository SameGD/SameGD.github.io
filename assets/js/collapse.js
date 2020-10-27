function toggleDiv(e) {
  var collapsediv = e.nextElementSibling;
  if (collapsediv.classList.contains("is-hidden")) {
    collapsediv.classList.remove("is-hidden");
    e.innerHTML = "Collapse";
  } else {
    collapsediv.classList.add("is-hidden");
    e.innerHTML = "Expand";
  } 
}