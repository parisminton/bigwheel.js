/* 
 * > bigwheel.js 0.5.0 <
 *
 * My go-to JavaScript functions.
 * 
 * james@da.ydrea.ms
 *
 */

(function () {

  var bW = (typeof window.bW === 'function') ? window.bW : function (selector) {

    bW.forms = bW.forms || [];

    bW.uniq = function (list) {
      var i,
          len = list.length,
          j,
          j_len,
          uniques = [],
          is_unique;

      function compare (l_val, u_val) {
        var i,
            len;
            
        if (/string|number|boolean/.test(typeof l_val) ||
            /HTML|Node/.test(l_val.constructor.toString())) {
          if (l_val === u_val) {
            is_unique = false;
          }
        }
        else if (Array.isArray(l_val)) {
          len = l_val.length;
          if (Array.isArray(u_val)) {
            for (i = 0; i < len; i += 1) {
              if (l_val[i] != u_val[i]) { break };
              // if we reach the end of the loop and all values
              // have been identical in the same sequence,
              // this array is not unique
              if (i === (len - 1)) {
                is_unique = false;
              }
            } // end array comparison loop
          }
        }
        else if (/Object/.test(l_val.constructor.toString())) {
          if (JSON.stringify(l_val) === JSON.stringify(u_val)) {
            is_unique = false;
          }
        }
        return is_unique;
      } // end compare

      for (i = 0; i < len; i += 1) {
        is_unique = true;
        if (i === 0) {
          uniques.push(list[i]);
        }
        j_len = uniques.length;
        for (j = 0; j < j_len; j += 1) {
          compare(list[i], uniques[j]);
          if (!is_unique) { break };
        }
        if (is_unique) {
          uniques.push(list[i]);
        }
      }
      return uniques;
    } // end bW.uniq


    // ### bW selector engine and constructor ###
    function selectElements (selectr, scope) {
      var getter;

      scope = scope || document;

      function filterHTMLCollection (list, getter, filter, attr) {
        var i,
            len = list.length,
            nodes,
            filtered_nodes = []; 

        function parseNodes (list) {
          var i,
              len = list.length;

          for (i = 0; i < len; i += 1 ) {
            filtered_nodes.push(list[i]);
          }
        } // end parseNodes

        function drillDown (list) {
          var i,
              len = list.length;

          for (i = 0; i < len; i += 1) {
            nodes = list[i][getter](filter);

            if (!nodes) {
              throw new Error('Your selector doesn\'t create a valid DOM method.');
            }
            else if (nodes && nodes.constructor === HTMLCollection ||
                nodes.constructor === NodeList) {
              parseNodes(nodes);
            }
            else {
              filtered_nodes.push(nodes);
            }
          }
        } // end drillDown

        // an inefficient last resort for when the attribute selector is not scoped
        function scanAllAttributes (attr, start_node) {
          var start_node = start_node || document.getElementsByTagName('html')[0],
              collection = [];

          function testForAttribute (node) {
            var j,
                len;

            if (/1|9/.test(node.nodeType) && node.hasAttribute(attr)) {
              collection.push(node);
            }
            if (/1|9/.test(node.nodeType) && node.hasChildNodes()) {
              j = 0;
              len = node.childNodes.length;

              for (j = 0; j < len; j += 1) {
                testForAttribute(node.childNodes[j]);
              }
            }
          }

          // the document node doesn't have the hasAttribute method
          if (start_node === document) {
            start_node = document.getElementsByTagName('html')[0];
          }

          testForAttribute(start_node);

          return list = collection;
        } // end scanAllAttributes

        function findAttribute (list) {
          var i,
              len = list.length,
              node_container = [];

          if (getter === 'drillForAttribute') {
            for (i = 0; i < len; i += 1) {
              list = scanAllAttributes(filter, list[i]);
              node_container = node_container.concat(list);
            }
            list = node_container;
          }
          else if (getter === 'testForAttribute') {
          }

          len = list.length;

          for (i = 0; i < len; i += 1) {
            if (list[i].hasAttribute) {
              if (list[i].hasAttribute(filter)) {
                filtered_nodes.push(list[i]);
              }
            }
          }
        } // end findAttribute

        function matchAttribute (list) {
          var i,
              len = list.length,
              attr_rx = new RegExp(filter);

          for (i = 0; i < len; i += 1) {
            if (attr_rx.test(list[i].getAttribute(attr))) {
              filtered_nodes.push(list[i]);
            }
          }
        } // end matchAttribute


        function matchRegex (list) {
          var patterns = filter.match(/\/.+?\//g),
              rx = filter,
              i,
              j,
              identifier = (attr === 'class') ? 'className' : 'id',
              class_list,
              p_len,
              l_len,
              cl_len;

          // creating a global regex that'll match a string
          // masquerading as a regex is way harder than it
          // ought to be ... just like this code
          function rxer (rx_string) {
            var letters,
                quantifier,
                q_rx;

            if (/\/\\.+\//.test(rx_string)) {
              letters = /\/\\(.+)\//.exec(rx_string)[1];
              if (/\+|\?|\*/.test(letters)) {
                quantifier = /(\+|\?|\*)/.exec(letters)[1];
                q_rx = new RegExp('\\' + quantifier, 'g');
                letters = letters.replace(q_rx, '\\' + quantifier);
              }
              return new RegExp('\/\\\\' + letters + '\/', 'g');
            }
          }
          
          patterns = bW.uniq(patterns);
          p_len = patterns.length;

          for (i = 0; i < p_len; i += 1) {
            if (/^\/.+\/$/.test(patterns[i])) {
              rx = rx.replace(
                rxer(patterns[i], 'g'), patterns[i].replace(/^\/|\/$/g, '')
              );
            }
          }

          rx = new RegExp(rx);

          if (list[0] === document && list.length === 1) {
            list = scanAllAttributes(attr); // returns list
          }
          l_len = list.length;

          for (i = 0; i < l_len; i += 1) {
            if (identifier === 'className') {
              class_list = list[i][identifier].split(' ');
              cl_len = class_list.length;

              for (j = 0; j < cl_len; j += 1) {
                if (rx.test(class_list[j])) {
                  filtered_nodes.push(list[i]);
                  break;
                }
              }
            }
            else if (rx.test(list[i][identifier])) {
              filtered_nodes.push(list[i]);
            }
          }

          return rx;
        } // end matchRegex

        function matchSpecifier (list) {
          var i,
              j,
              len = list.length,
              cl_len,
              rx = new RegExp(filter),
              class_list;

          for (i = 0; i < len; i += 1) {
            // class matches need to be exact, not partial
            if (getter === 'className') {
              class_list = list[i][getter].split(' ');
              cl_len = class_list.length;

              for (j = 0; j < cl_len; j += 1) {
                if (filter === class_list[j]) {
                  filtered_nodes.push(list[i]);
                }
              }
            }
            else {
              filtered_nodes.push(list[i]);
            }
          }
        } // end matchSpecifier

        if (/className|id/.test(getter)) {
          matchSpecifier(list);
        }
        else if (/drillForAttribute|testForAttribute/.test(getter)) {
          findAttribute(list);
        }
        else if (/matchAttribute/.test(getter)) {
          matchAttribute(list);
        }
        else if (/matchRegex/.test(getter)) {
          matchRegex(list);
        }
        else {
          drillDown(list);
        }

        scope = bW.uniq(filtered_nodes);
        return scope;
      } // end filterHTMLCollection

      function selectFromString (slctr) {
        var slctr_array = slctr.split(','),
            parsed = [],
            i,
            j,
            retained_scope = scope;

        function select (s) {
          var tokens = s.match(/[a-zA-Z0-9_-]\.[a-zA-Z0-9_-]|\s+\.|^\.|[a-zA-Z0-9_-]#[a-zA-Z0-9_-]|\s+#|^#|[a-zA-Z0-9_-]\[[a-zA-Z0-9_-]|\s+\[|^\[|[\|\*\^\$\~\!]?=["']|\s+|\./g) || [],
              flags = s.split(/\s+|\.|#|\[|[\|\*\^\$\~\!]?=["']|["']?\]/g) || [],
              attr,
              filtered = [],
              i;
          
          // remove any empties from Array.split
          for (i = 0; i < flags.length; i += 1) {
            if (flags[i].length) {
              filtered.push(flags[i]);
            }
          }
          flags = filtered;

          // no token precedes the flag, so keep arrays in sync
          // this means the scope is document -- we'll search by tag name
          if (tokens.length < flags.length) {
            tokens.unshift('tagname');
          }

          for (i = 0; i < flags.length; i += 1) {

            if (/^\.|\s+\./.test(tokens[i])) {
              getter = 'getElementsByClassName';
            }

            if (/^#|\s+#/.test(tokens[i])) {
              getter = 'getElementById';
              scope = document;
            }

            if (/tagname|\s+/.test(tokens[i]) && !/\.|#/.test(tokens[i])) {
              getter = 'getElementsByTagName';
            }

            if (/[a-zA-Z0-9_-]\.[a-zA-Z0-9_-]/.test(tokens[i])) {
              getter = 'className';
            }

            if (/[a-zA-Z0-9_-]#[a-zA-Z0-9_-]/.test(tokens[i])) {
              getter = 'id';
            }

            if (/\s+\[|^\[/.test(tokens[i])) {
              attr = flags[i];
              getter = 'drillForAttribute';
            }
            
            if (/[a-zA-Z0-9_-]\[[a-zA-Z0-9_-]/.test(tokens[i])) {
              attr = flags[i];
              getter = 'testForAttribute';
            }
            
            if (/[\|\*\^\$\~\!]?=/.test(tokens[i])) {
              getter = 'matchAttribute';
            }

            if (/\/(.*)\//.test(flags[i])) {
              getter = 'matchRegex';

              if (/\./.test(tokens[i])) {
                attr = 'class';
              }
              else if (/\#/.test(tokens[i])) {
                attr = 'id';
              }
              else {
                throw new Error('Bigwheel can only perform regular expression matches using a class or ID selector -- strings that contain a period (.) or pound sign (#).');
              }
            }

            // put singular DOM references, but not HTMLCollections, in an array
            // filterHTMLCollection always stores its results in a true array
            if (typeof scope.length === 'undefined') {
              scope = [scope];
            }
            filterHTMLCollection(scope, getter, flags[i], attr);

          } // end tokens/flags loop

        } // end select

        if (slctr_array.length > 1) {
          for (i = 0; i < slctr_array.length; i += 1) {
            scope = retained_scope; // consistent scope inside this loop
            select(slctr_array[i].replace(/^\s+/, ''));
            // scope is always an array at this point. we just want its members.
            for (j = 0; j < scope.length; j += 1) {
              parsed.push(scope[j]);
            }
          }
          scope = parsed;
        }
        else {
          select(slctr_array[0]);
        }

      } // end selectFromString

      if (typeof selectr === 'string') {
        selectFromString(selectr);
      }
      else if (/HTML/.test(selectr.constructor.toString())) {
        if (!selectr.length || 
            // HTML select elements have a length property
            /HTMLSelectElement/.test(selectr.constructor.toString())) { selectr = [selectr] };
        scope = selectr;
      }

      return scope;
    } // end selectElements

    function plusClass (elem) {
      var addl_classes = [],
          class_list,
          i,
          len;

      // we don't know how many arguments we may get here
      for (i = 1; i < arguments.length; i += 1) {
        addl_classes.push(arguments[i]);
      }

      len = addl_classes.length;

      if (elem.classList) {
        for (i = 0; i < len; i += 1) {
          elem.classList.add(addl_classes[i]);
        }
      }
      else {
        class_list = elem.className.split(' ');
        for (i = 0; i < len; i += 1) {
          class_list.push(addl_classes[i]);
        }
        elem.className = class_list.join(' ');
      }
    } // end plusClass

    function minusClass (elem) {
      var retiring_classes = [],
          retire,
          class_list,
          i,
          j,
          len;

      // we don't know how many arguments we may get here
      for (i = 1; i < arguments.length; i += 1) {
        retiring_classes.push(arguments[i]);
      }

      len = retiring_classes.length;

      if (elem.classList) {
        for (i = 0; i < len; i += 1) {
          elem.classList.remove(retiring_classes[i]);
        }
      }
      else {
        class_list = elem.className.split(' ');
        for (i = 0; i < len; i += 1) {
          retire = new RegExp(retiring_classes[i]);
          for (j = 0; j < class_list.length; j += 1) {
            if (retire.test(class_list[j])) {
              class_list.splice(j, 1);
            }
          }
        }
        elem.className = class_list.join(' ');
      }
    } // end minusClass

    function parseArray () {
      var args = [],
          filtered = [],
          i,
          key,
          len = arguments.length;

      if (len > 1) {
        for (i = 0; i < len; i += 1) {
          if (typeof arguments[i] === 'string') {
            args.push(arguments[i]);
          }
        }
      }
      else {
        if (typeof arguments[0] === 'object') {
          for (key in arguments[0]) {
            args.push(arguments[0][key]);
          }
        }
        else if (typeof arguments[0] === 'string') {
          args = arguments[0].split(/[,\s+|\s+|,]/);

          // remove any empty strings Array.split might have added
          for (i = 0; i < args.length; i += 1) {
            if (args[i].length) { filtered.push(args[i]); }
          }
          args = filtered;
        }
      }
      return args;
    } // end parseArray

    bW.copyProperties = function (donor, recipient) {
      var key;

      for (key in donor) {
        if (Array.isArray(donor[key])) {
          recipient[key] = [];
          bW.copyProperties(donor[key], recipient[key]);
        }
        else if (typeof donor[key] === 'object') {
          recipient[key] = {};
          bW.copyProperties(donor[key], recipient[key]);
        }
        else {
          recipient[key] = donor[key];
        }
      }
    } // end bW.copyProperties

    bW.parameterize = function (obj) {
      var params = [],
          current,
          key;

      for (key in obj) {
        current = params.length;
        params[current] = encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
      }
      return '?' + params.join('&');

    } // end bW.parameterize

    function Bigwheel (elements) {
      var instance = this,
          i,
          len = elements.length;

      function generateId () {
        var alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            id = '', 
            i;

        function pick () {
          if (Math.random() > 0.5) {
            id += Math.floor(Math.random() * 10);
          }
          else {
            id += alpha[Math.floor(Math.random() * 52)];
          }
        }

        for (i = 0; i < 5; i += 1) {
          pick();
        }
        return id;
      } // end generateId

      for (i = 0; i < len; i += 1) {
        instance[i] = elements[i];
        instance[i].ndx = i;
        instance[i].bWid = generateId();
        instance.length = (i + 1);
      }

      if (len === 0) {
        instance.length = 0;
      }
    } // end Bigwheel constructor

    Bigwheel.prototype = {

      // ### PROPERTIES
      event_registry : { length: 0 },

      // ### HELPERS: will probably be most useful to other bW methods, not users.
      wrap : function (elem_refs) {
        var args_array = [],
            i;

        if (!elem_refs.length && /HTML/.test(elem_refs.constructor.toString())) {
          elem_refs = [elem_refs];
        }

        if (elem_refs.length) {
          return new Bigwheel(elem_refs);
        }
      }, // end bW.wrap

      all : function (func, args) {
        var args_array = [],
            i,
            remove = 1;

        // copy everything to args_array
        // args, ^above^, should be an array-like object. if not, convert it.
        if (!args.length) {
          for (i = 1; i < arguments.length; i += 1) {
            args_array.push(arguments[i]);
          }
        }
        else {
          for (i = 0; i < args.length; i += 1) {
            args_array.push(args[i]);
          }
        }

        for (i = 0; i < this.length; i += 1) {
          args_array.unshift(this[i]);
          func.apply(this, args_array);
          args_array.splice(0, remove);
        }

        return this;
      }, // end bW.all

      each : function (func) {
        var instance = this,
            i,
            len = instance.length;

        for (i = 0; i < len; i += 1) {
          func.apply(instance, [i, instance[i]]);
        }
        
        return instance;
      }, // end bW.each

      first : function () {
        return this.wrap(this[0]);
      }, // end bW.first

      // ### METHODS THAT OPERATE ON ALL ELEMENTS IN THE SET and return the bW object
      css : function (prop, value) {
        if (!prop) { return this; }

        function setCSS (elem, prop, value) {
          elem.style[prop] = value;
        }

        return this.all(setCSS, arguments);
      }, // end bW.css

      addClass : function () {
        var args = parseArray(arguments);

        return this.all(plusClass, args);
      }, // end bW.addClass

      removeClass : function () {
        var args = parseArray(arguments);

        return this.all(minusClass, args);
      }, // end bW.removeClass

      listenFor : function (evt, func, capt, aargs) {

        function listen (elem, evt, func, capt, aargs) {
          var instance = this;

          function add () {
            // W3C-compliant browsers
            if (elem.addEventListener) {
              if (!instance.listener_model) { instance.listener_model = 'addEventListener'; }
              elem.addEventListener(evt, func, capt);
            }
            // IE pre-9
            else {
              if (elem.attachEvent) { 
                if (!instance.listener_model) { instance.listener_model = 'attachEvent'; }
                elem.attachEvent(('on' + evt), func);
              }
              // fall back to DOM level 0
              else { 
                if (!instance.listener_model) { instance.listener_model = 'onevent'; }
                elem['on' + evt] = func;
              }
            }
          } // end add

          // store these values in a registry, so we can retrieve them
          function register () {
            var rx = /function ([a-zA-Z-_]*)\(/;

            // ### more valuable for the key to be a unique ID or the event type string?
            instance.event_registry[elem.ndx] = {};
            instance.event_registry[elem.ndx][evt] = {
              elem : elem,
              evt : evt,
              func : func,
              capt : capt,
              aargs : aargs
            };
            instance.event_registry.length += 1;
          } // end register

          add();
          register();
        } // end listen

        return this.all(listen, arguments);
      }, // end bW.listenFor

      stopListening : function (evt, func) {
        var instance = this;

        function dontListen (elem, evt, func, capt) {

          function remove () {
            if (elem.removeEventListener) {
              elem.removeEventListener(evt, func, capt);
            }
            else {
              if (elem.detachEvent) {
                elem.detachEvent(('on' + evt), func);
              }
              else {
                elem[evt] = null;
              }
            }
          } // end remove

          function unregister () {
            var count = 0,
                key;

            if (instance.event_registry.length > 0) {
              delete instance.event_registry[elem.ndx][evt];
              for (key in instance.event_registry[elem.ndx]) {
                count += 1
              }
              instance.event_registry.length = count;

              if (count === 0) {
                delete instance.event_registry[elem.ndx];
              }
            }
          } // end unregister

          remove();
          unregister();
        } // end dontListen

        return instance.all(dontListen, arguments);
      }, // end bW.stopListening

      before : function (elem) {
        function insert (after, elem) {
          after.parentNode.insertBefore(elem, after);
        }

        return this.all(insert, arguments);
      }, // end bW.before

      after : function (elem) {
        function insert (before, elem) {
          before.parentNode.insertBefore(elem, before.nextSibling);
        }

        return this.all(insert, arguments);
      }, // end bW.after

      // ### METHODS THAT RETURN A VALUE from a single element, not the bW object
      val : function () {
        if (this[0].value) { return this[0].value; }
      }, // end bW.val

      data : function (selector, new_value) {
        var instance = this;

        function getData (slctr) {
          if (instance[0].dataset) { return instance[0].dataset[slctr]; }
          else {
            return instance[0].getAttribute('data-' + slctr);
          }
        }

        function setData (slctr, val) {
          var data_attr;

          if (instance[0].dataset) { instance[0].dataset[slctr] = val; }
          else if (instance[0].setAttribute) {
            instance[0].setAttribute('data-' + slctr, val);
          }
          else if (instance[0].attributes.setNamedItem) {
            data_attr = document.createAttribute('data-' + slctr);
            data_attr.nodeValue = val;
            instance[0].attributes.setNamedItem(data_attr);
          }
        }
        
        if (!new_value) {
          return getData(selector);
        }
        else {
          setData(selector, new_value);
          return this;
        }
      }, // end bW.data

      find : function (slctr) {
        var collection = [],
            i,
            new_scope;

        for (i = 0; i < this.length; i += 1) {
          collection.push(this[i]);
        }

        new_scope = selectElements(slctr, collection);
        return new Bigwheel(new_scope);
      }, // end bW.find

      remove : function () {
        function removeElement (elem) {
          elem.parentNode.removeChild(elem);
        }

        return this.all(removeElement, arguments);
      }, // end bW.remove

      not : function (slctr) {
        var comparison_set = selectElements(slctr);

        function reindex (inst) {
          var remainders = [],
              i;

          for (i = 0; i < inst.length; i += 1) {
            if (inst[i]) {
              remainders.push(inst[i]);
              delete inst[i];
            }
          }

          for (i = 0; i < remainders.length; i += 1) {
            inst[i] = remainders[i];
            inst[i].ndx = i;
          }
          inst.length = remainders.length;
        } // end reindex

        function compare (elem) {
          var i,
              comparator = arguments[0];

          for (i = 1; i < arguments.length; i += 1) {
            if (comparator === arguments[i]) {
              delete this[comparator.ndx];
              break;
            }
          }
        } // end compare
        this.all(compare, comparison_set);
        reindex(this);
        return this;
      }, // end bW.not

      setForm : function (submit_selector, suffix) {
        var form = this[0],
            submit,
            form_obj;

        if (!submit_selector) {
          throw new Error('bW.setForm should be invoked with a selector for a submit button.');
        }
        else {
          submit = selectElements(submit_selector)[0];
        }

        form_obj = new BigwheelForm(form, submit, suffix);
        form_obj.init();
        return form_obj;
      }, // end bW.setForm

      ajax : ajaxFunc,

    } // end Bigwheel prototype

    function BigwheelForm (form_element, submit_button, class_suffix) {
      var instance = this,
          fclass,
          fields = selectElements('input, textarea, select'),
          prop,
          i;

      instance[0] = instance.form = form_element;
      instance.submit = submit_button;
      instance.length = 1;
      instance.fields = {};
      instance.required_fields = [];
      instance.collectors = {};
      instance.formData = {};

      // ### bWF HELPERS  ###
      function bruiseField (field) {
        if (/TEXTAREA|SELECT/.test(field.nodeName)
          || /text|fieldset/.test(field.type)) {
          plusClass(field, 'bW-invalid-field');
        }
      } // end bruiseField

      function areFieldsEmpty () {
        var i,
            empty = false,
            req = instance.required_fields;

        for (i = 0; i < req.length; i += 1) {
          if (req[i].value === '') {
            bruiseField(req[i]);
            empty = true;
          }
        }
        if (empty) {
          // prepare error message
        }
        return empty;
      } // end areFieldsEmpty

      if (class_suffix) {
        fclass = 'bW-form-' + class_suffix;
        if (!/fclass/.test(instance[0].className)) {
          plusClass(instance[0], fclass);
        }
        fclass = 'bW-submit-' + class_suffix;
        if (!/fclass/.test(instance.submit.className)) {
          plusClass(instance.submit, fclass);
        }
      }
      
      for (i = 0; i < fields.length; i += 1) {
        // exclude the submit button
        if (fields[i] === instance.submit) {
          continue
        }
        else {
          if (!fields[i].name) {
            console.error(fields[i]);
            throw new Error('^^^ A "name" property is required for each input element within the "bW-form-' + class_suffix + '" form.');
          }
          else {
            instance.fields[fields[i].name] = fields[i];
          }
        }
      }
      
      // ### BigwheelForm prototype needs all the Bigwheel.prototype methods ###
      for (var prop in Bigwheel.prototype) {
        BigwheelForm.prototype[prop] = Bigwheel.prototype[prop];
      }

      f = BigwheelForm.prototype;

      f.setRequiredFields = function (slctr) {
        var i,
            rf = selectElements(slctr);

        for (i = 0; i < rf.length; i += 1) {
          instance.required_fields.push(rf[i]);
          plusClass(rf[i], 'bW-required-field');
        }

        return instance;
      } // end bWF.setRequiredFields

      f.val = function (name) {
        if (instance.fields[name]) { return instance.fields[name].value; }
      } // end bWF.val

      f.collectValues = function () {
        var fd_buffer = {};

        // remove empties from Array.split
        function filter (pa) {
          var prop_array = [],
              i,
              len = pa.length;

          for (i = 0; i < len; i += 1) {
            if (!pa[i].length) {
              pa.splice(i, 1);
              len = (len - 1);
            }
          }
        } // end filter

        function collect (selector) {
          var selected = bW(selector),
              i,
              len = selected.length;

          function sort (selectr) {
            var nodes = selectr.split(/\d+_+/),
                indices = getIndices(selectr),
                scope,
                n_len;

            n_len = nodes.length;

            function getIndices (selectr) {
              var indices = [],
                  rx = /(\d+)_/g,
                  match;

              while ((match = rx.exec(selectr)) != null) {
                indices.push(match[1]);
              }
              return (indices.length) ? indices : false;
            } // end getIndices

            function store (nodez, indicez) {
              var n,
                  n_len = nodez.length,
                  fscope = fd_buffer;

              // drill as deep as necessary for this loop,
              // but always start it from top-level fd_buffer
              for (n = 0; n < n_len; n += 1) {
                if (nodez[n]) {
                  // no index; we expect this to be a flat node
                  if (indicez[n] === undefined) {
                    // fscope[nodez[n]] = bW('#' + selectr).val();
                    fscope[nodez[n]] = document.querySelector('[name="' + selectr + '"]').value;
                  }
                  else {
                    // initialize the array
                    fscope[nodez[n]] = fscope[nodez[n]] || [];
                    fscope[nodez[n]][indicez[n]] = 
                      fscope[nodez[n]][indicez[n]] || {};
                    fscope = fscope[nodez[n]][indicez[n]];
                  }
                } // end if (n_len)
              } // end for loop 
            } // end store

            store(nodes, indices);
          } // end sort

          for (i = 0; i < len; i += 1) {
            // TODO: Documentation should strongly encourage 
            // that each field has a name
            sort(selected[i].name);
          }

        } // end collect

        for (var name in instance.fields) {
          collect(instance.fields[name]);
        }

        bW.copyProperties(fd_buffer, instance.formData);
      } // end bWF.collectValues


      f.addToTests = function (test) {
        f.tests = f.tests || [];
        f.tests.push(test);
      } // end bWF.addToTests

      f.init = function () {
        var instance = this;
      } // end bWF.init

      f.readyToSubmitForm = function () {
        var ready_to_submit = true,
            tests = [
              f.areFieldsEmpty,
              f.outsideSubmissionLimit,
              f.outsideTextLimit
            ],
            i;

        f.unBruiseFields();

        bW('.bW-validation-error-message').remove();
        if (arguments.length > 0) {
          for (i = 0; i < arguments.length; i+= 0) {
            tests.push(arguments [i]);
          }
        }

        for (i = 0; i < tests.length; i += 1) {
          // each test is for an error, so if one returns true, something\'s wrong
          if (tests[i](f.fields, f.event_obj.target)) {
            ready_to_submit = false;
            // bW('.submitphoto').removeClass('ready');
          }
        }
        // bW('.submitphoto').addClass('ready');
        return ready_to_submit;
      } // end readyToSubmitForm

      f.sendData = function () {
        f.collectValuesAsJSON();
        f.collectImagesAsJSON();
        f.collectLocationDescriptionsAsJSON();

        ajaxOpts = {
          type: 'POST',
          url: url_goes_here,
          data: f.formData,
          success: function (data) {
            f.showThanks();
          },
          error: function (e, status, error_thrown) {
            console.log('Form at ' + document.location.href + ' failed to submit with the error: "' + e.status + ' ' + error_thrown + '".');
            f.addErrorMessage('There was a problem processing your submission. Please try again.');
            form.find('.field').first().addClass('bW-invalid-field');
            f.showErrorToast();
            form.find('.field').first().removeClass('bW-invalid-field');
          }
        }

        bW.ajax(ajaxOpts);
      } // end bWF.sendData

      f.submitHandler = function (evt) {
        evt.preventDefault();
        f.collectValues();
        /*
        if (f.readyToSubmitForm()) {
          f.sendData();
        }
        else {
          f.showErrorToast();
        }
        */
      }
      // ### end BigwheelForm prototype ###

      bW(instance.submit).listenFor('click', instance.submitHandler, true);
    } // end BigwheelForm constructor

    return new Bigwheel(selectElements(selector));

  }, // end bW selector engine and constructor
      
  ajaxFunc = function (url, ajaxSettings) {
    var bWXHR = function () {
      this.xhr = new XMLHttpRequest();
      this.setup = function (s) {
        var dataTypes = {
          json : 'application/json',
          xml : 'application/xml', 
          html : 'text/html',
          text : 'text/plain',
          script : 'text/javascript'
          // jsonp : create a new <script> tag
        };

        if (s.dataType) {
          this.xhr.setRequestHeader('Accept', dataTypes[s.dataType]);
        }
      },
      this.done = function (func) {
        console.log('We must be in love.');
        console.log(this);
        if (typeof func === 'string') {
          console.log(func);
        }
        // if (func) { func(); }
      },
      this.fail = function (func) {},
      this.always = function (func) {},
      this.then = function (func) {}
    },
    settings = {
      method : 'get',
      async : true
    },
    query_params = '',
    bX;

    if (ajaxSettings && typeof ajaxSettings === 'object') {
      bW.copyProperties(ajaxSettings, settings);
    }

    if (typeof url === 'object') {
      bW.copyProperties(url, settings);
    }

    // the first argument here will trump any URL 
    // specified in ajaxSettings
    if (typeof url === 'string') {
      /* ### TODO: Should this be sanitized? ### */
      settings.url = url;
    }
    /* ### BELOW THIS POINT, ajaxSettings HAS BEEN MAPPED TO settings ### */

    // prepare the URL -- concatenate base and query parameters
    if (settings.data && typeof settings.data === 'object') {
      query_params = bW.parameterize(settings.data);
      settings.purl = settings.url + query_params; 
    }

    if (typeof settings.success != 'function') {
      // raise error
    }

    bX = new bWXHR();

    function bWXHRError(message) {
      this.message = message || 'Something went wrong with your AJAX request.';
      this.name = 'bWXHRError';
      this.stack = new Error().stack;
    }
    bWXHRError.prototype = new Error();
    bWXHRError.constructor = Error;

    // XMLHttpRequest prep and transaction
    bX.xhr.addEventListener('load', function (data, status) {
      if (/400/.test(bX.xhr.status)) {
        // if there's a specialized message, show it
        if (JSON.parse(bX.xhr.responseText).error) {
          throw new bWXHRError(JSON.parse(bX.xhr.responseText).error);
        }
      }
      else {
        settings.success(bX.xhr.responseText, bX.xhr.statusText);
      }
      return bX;
    });
    bX.xhr.addEventListener('error', function (error, status) {
      settings.error(bX.xhr);
      return bX;
    });
    bX.xhr.open(settings.method, settings.purl, settings.async);
    // modifying headers, etc. has to happen after opening but before sending
    bX.setup(settings);
    bX.xhr.send();

    // bW.ajax({
    //   type : 'POST',
    //   url : 'http://somethingorother.com',
    //   data : data_var,
    //   success : functionThatConfirmsDataWasSaved,
    //   error : functionThatExplainsTheError
    // });
    
    return bX;
  }; // end ajaxFunc

  bW.ajax = ajaxFunc;
            
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return bW;
    });
  }

  return bW;

}());

console.log('I can take you there. Just follow me.');
