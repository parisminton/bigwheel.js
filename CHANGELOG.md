bigwheel.js
===========

Changelog
---------

*8/3/14*

1. Store fields as an object, not an array, to access fields directly by name.

2. `bWF.val` returns field values.


*8/2/14*

1. Forms store references to all their fields at instantiation.

2. `collectFields` saves all field values to the instance's `data` property.


*7/31/14*

1. The Bigwheel constructor stores each element reference's index in its own `ndx` property.

2. `bW.not` excludes elements from the selected set.


*7/30/14*

1. `bW.remove` detaches all matched elements from the DOM.

2. `bW.setRequiredFields` tells a form instance which fields cannot be ignored.

3. A few helpers get moved to the bW wrapper.


*7/28/14*

1. Calling `bW.stopListening` for an event removes it from the registry.

2. `bW.event_registry` gets a `length` property, though it's an object.


*7/27/14*

1. The Bigwheel constructor generates a unique ID for each matched element, stored in the element's `bWid` property.


*7/25/14*

1. The selector engine handles commas. This enables multiple selectors (`bW('#wrapper, .nav .button, .footer p')`).


*7/18/14*

1. `bW.stopListening` detaches events.


*7/6/14*

1. `bW.first` returns the first matched element in the set.


*7/5/14*

1. `bW.find` takes a selector and grabs all the matching elements within the scope of the current ones. It returns a new `Bigwheel` object.

2. The `bW.wrap` helper accepts a DOM reference and returns a Bigwheel object.

3. Got rid of the `selector` property.


*7/4/14*

1. `bW.data` reads and writes data attributes.


*7/3/14*

1. `bW.addClass` and `bW.removeClass` use `classList` or fall back to `className`. 

2. Replacing the ECMAScript 5 Array methods with simpler constructions to keep things old-IE-friendly.

3. `bW.parseArray` makes string -> array conversion easier.


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
