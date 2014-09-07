function selectWithAttributes (s) {
  var attr_rx = /([a-zA-Z0-9_\-#\.]+)\[([a-zA-Z0-9_\-]+)([\^\$\*\~\!\|]?=)["']([a-zA-Z0-9\.\:\?\#\/]+)["']\]|\[([a-zA-Z0-9_\-]+)([\^\$\*\~\!\|]?=)["']([a-zA-Z0-9\.\:\?\#\/]+)["']\]|([a-zA-Z0-9_\-#\.]+)\[([a-zA-Z0-9_\-]+)\]|\[([a-zA-Z0-9_\-]+)\]/,
      tokens_rx = /\^=|\*=|\~=|\|=|\$=|\!=|=/,
      attr_array = attr_rx.exec(s),
      scope,
      attr,
      token,
      value;

  function reduce (results_array) {
    var reduced_results = [],
        i;
    
    for (i = 0; i < results_array.length; i += 1) {
      if (results_array[i] != undefined ) {
        reduced_results.push(results_array[i]);
      }
    }
    return reduced_results;
  }

  attr_array = reduce(attr_array);

  // '[attribute]'
  if (attr_array.length === 2) {
    attr = attr_array[1];
  }

  // 'element[attribute]'
  if (attr_array.length === 3) {
    scope = attr_array[1];
    attr = attr_array[2];
  }

  // '[attribute*="value"]'
  if (attr_array.length === 4) {
    attr = attr_array[1];
    token = attr_array[2];
    value = attr_array[3];
  }

  // 'element[attribute*="value"]'
  if (attr_array.length === 5) {
    scope = attr_array[1];
    attr = attr_array[2];
    token = attr_array[3];
    value = attr_array[4];
  }

} // end selectWithAttributes

// handle attribute selector
if (/\[[a-zA-Z0-9_\-=\^\$\*\~\!\|"'\.\:\?\#\/]+\]/.test(s)) {
  // selectWithAttributes
}
else {
  // normal stuff; selectWithoutAttributes
}
