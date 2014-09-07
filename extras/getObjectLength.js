/* ...because objects don\'t offer a length property, this counter helps in loops... */
function getObjectLength(obj, prop) {
  var length = 0;
  if (arguments.length == 2) {
    obj = obj.prop;
  }
  for (member in obj) {
    if (obj.hasOwnProperty(member)) {
      length += 1;
    }
  }
  return length;
};
