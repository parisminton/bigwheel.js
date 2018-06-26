bigwheel.js
===========

Changelog
---------

*6/25/18*

- In `bW.ajax()`, derive a form's action and HTTP method from the form itself.


*12/27/17*

- Change `bW.setAttr()` to `bW.attr`, making it a getter *and* a setter. Better enforcement of the method signature and helpful error reporting (I hope.)


*12/26/17*

- Add a `bW.setAttr()` method for updating attributes.

- Scope form field inspection to the form itself.


*6/20/17*

- Instances of bWXHR default to 'GET' and JSON. Better detection of the method and data type.


*6/19/17*

- `bWF.setForm()` defaults to POSTing JSON, but allows old school query parameters.


*1/17/17*

- `bW.val()` can set values, not just get them.


*12/27/16*

- `bWF.parameterize()` handles multidimensional structures.


*8/18/16*

- Fix for selecting `select` elements via a DOM reference.


*8/17/16*

- Get rid of `bWF.addCollector()`.


*8/7/16*

- Attribute selectors work when scoped.


*8/1/16*

- Changed the way form values are collected.


*2/23/16*

- Improved regex parsing in bWF.collectValues.

- Renamed `storeUniques` to `uniq`, and moved it one level up, to the *bW* object, so other functions could have access to it.


*9/7/15*

- The *bWXHR* object supports an error callback.


*9/1/15*

- `bW.ajax` wraps the XMLHttpRequest object.


*4/5/15*

- Fixed the compound class selector, closing #26.


*11/16/14*

- It may need some refactoring, but `bWF.collectValues` works.


*11/6/14*

- Class selectors do exact, not inclusive matches. So `bW('.^exercise/\\d+/$')` will not match the class `exercise0_set0`.


*10/27/14*

- Support for selector strings with interpolated regular expressions.


*9/20/14*

- `bW.each` iterates through each element in the `Bigwheel` object.


*9/11/14*

- `bWF.addCollector` stores custom collection functions.


*9/6/14*

- Attribute selector works. (`bW('input[type="text"]')`);


*8/3/14*

- Store fields as an object, not an array, to access fields directly by name.

- `bWF.val` returns field values.

- `bWF.areFieldsEmpty` validates required fields. `bWF.bruiseField` identifies invalid fields.


*8/2/14*

- Forms store references to all their fields at instantiation.

- `bW.collectFields` saves all field values to the instance's `data` property.


*7/31/14*

- The Bigwheel constructor stores each element reference's index in its own `ndx` property.

- `bW.not` excludes elements from the selected set.


*7/30/14*

- `bW.remove` detaches all matched elements from the DOM.

- `bW.setRequiredFields` tells a form instance which fields cannot be ignored.

- A few helpers get moved to the `bW` wrapper.


*7/28/14*

- Calling `bW.stopListening` for an event removes it from the registry.

- `bW.event_registry` gets a `length` property, though it's an object.


*7/27/14*

- The Bigwheel constructor generates a unique ID for each matched element, stored in the element's `bWid` property.


*7/25/14*

- The selector engine handles commas. This enables multiple selectors (`bW('#wrapper, .nav .button, .footer p')`).


*7/18/14*

- `bW.stopListening` detaches events.


*7/6/14*

- `bW.first` returns the first matched element in the set.


*7/5/14*

- `bW.find` takes a selector and grabs all the matching elements within the scope of the current ones. It returns a new `Bigwheel` object.

- The `bW.wrap` helper accepts a DOM reference and returns a `Bigwheel` object.

- Got rid of the `selector` property.


*7/4/14*

- `bW.data` reads and writes data attributes.


*7/3/14*

- `bW.addClass` and `bW.removeClass` use `classList` or fall back to `className`. 

- Replacing the ECMAScript 5 Array methods with simpler constructions to keep things old-IE-friendly.

- `bW.parseArray` makes string -> array conversion easier.


*7/2/14*

- `bW.val` returns the value of the first matched element in the set.

- Initial attempt at `bW.first`, a way to isolate only the first of the matched elements. It needs to wrap this element in the `Bigwheel` object.


*7/1/14*

- `bW.before` and `bW.after` insert a given element relative to each matched element in the DOM.

- Fixed a bug where calling `getElementById` on an element that was itself selected by ID (`bW('#firstID #secondID');`) threw an error. This isn't the best way to select things, but supporting it shouldn't cause Bigwheel to choke.


*6/20/14*

- `bW.all` calls a method on every element returned by the selector.

- `bW.css` sets style properties.


*6/16/14*

- `bW` is now a function that returns an instance of the `Bigwheel` object.


*6/1/14*

- Basic selector engine doesn't fail too much with IDs, classes and nested elements.


*5/30/14*

- This more recent *bigwheel.js* has more functionality for working with strings, forms and motion.
