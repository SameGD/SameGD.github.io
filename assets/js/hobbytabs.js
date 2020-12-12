let lastPressedTab = document.getElementById("first-tab");
let lastPressedItem = document.getElementById("first-item");

function toggleDiv(e) {
  var parentdiv = e.parentNode;
  
  var childIndex = Array.prototype.indexOf.call(parentdiv.children, e);
  
  console.log(childIndex);
  
  var collapsediv = parentdiv.parentNode.children[1].children[childIndex];
  
  lastPressedItem.classList.remove("active-hobby");
  e.classList.add("active-hobby"); 
  
  lastPressedTab.classList.add("is-hidden");
  collapsediv.classList.remove("is-hidden"); 

  lastPressedTab = collapsediv;
  lastPressedItem = e;
}