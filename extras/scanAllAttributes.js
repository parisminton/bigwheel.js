var list;

function scanAllAttributes (f) {
  var i,
      everything = document.getElementsByTagName('*'),
      elen = everything.length,
      collection = [];

  function testForAttribute (node) {
    var i,
        len;

    if (node.nodeType === 1 && node.hasAttribute(f)) {
      collection.push(node);
    }
    if (node.nodeType === 1 && node.hasChildNodes()) {
      i = 0;
      len = node.childNodes.length;

      for (i = 0; i < len; i += 1) {
        testForAttribute(node[i]);
      }
    }
  }

  for (i = 0; i < elen; i += 1) {
    testForAttribute(everything[i]);
  }

  list = collection;
  return collection;
} // end scanAllAttributes

console.log('Neurosis!');
