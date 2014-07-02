bigwheel.js
===========

Changelog
---------

*7/2/14*

1. `bW.val` returns the value of the first matched element in the set.

2. Initial attempt at `bW.first`, a way to isolate only the first of the matched elements. It needs to wrap this element in the `Bigwheel` object.



*7/1/14*

1. `bW.before` and `bW.after` insert a given element relative to each matched element in the DOM.

2. Fixed a bug where calling `getElementById` on an element that was itself selected by ID (`bW('#firstID #secondID');`) threw an error. This isn't the best way to select things, but supporting it shouldn't cause Bigwheel to choke.



*6/20/14*

1. `bW.all` calls a method on every element returned by the selector.

2. `bW.css` sets style properties.



*6/16/14*

1. `bW` is now a function that returns an instance of the `Bigwheel` object.



*6/1/14*

1. Basic selector engine doesn't fail too much with IDs, classes and nested elements.



*5/30/14*

1. This more recent *bigwheel.js* has more functionality for working with strings, forms and motion.
