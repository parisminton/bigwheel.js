


function myHandler(e) {
  var src, parts;

  // get event and source element
  e = e || window.event;
  src = e.target || e.srcElement;

  // actual work: update label
  parts = src.innerHTML.split(": ");
  parts[1] = parseInt(parts[1], 10) + 1;
  src.innerHTML = parts[0] + ": " + parts[1];

  // no bubble
  if (typeof e.stopPropagation === "function") {
    e.stopPropagation();
  }  
  if (typeof e.cancelBubble !== "undefined") {
    e.cancelBubble = true;
  }
  
  // prevent default action
  if (typeof e.preventDefault === "function") {
    e.preventDefault();
  }
  if (typeof e.returnValue !== "undefined") {
    e.returnValue = false;
  }
}