/* 
 * > bigwheel.js 0.3.0 <
 *
 * My go-to JavaScript functions.
 * 
 * james@da.ydrea.ms
 *
 */

(function () {

  var bW = (typeof window.bW === 'function') ? window.bW : function (selector) {

    bW.forms = bW.forms || [];

    // ### bW selector engine and constructor ###
    function selectElements (selectr, scope) {
      var getter;

      scope = scope || document;

      function filterHTMLCollection (list, getter, filter) {
        var i,
            len = list.length,
            nodes,
            filtered_nodes = []; 

        function storeUniques (list) {
          var i,
              len = list.length,
              uniques = [];

          for (i = 0; i < len; i += 1) {
            if (uniques.some(function (u) {
                return u === list[i];
              })) {
              continue;
            }
            uniques.push(list[i]);
          }
          return uniques;
        } // end storeUniques

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

            if (nodes.constructor === HTMLCollection ||
                nodes.constructor === NodeList) {
              parseNodes(nodes);
            }
            else {
              filtered_nodes.push(nodes);
            }
          }
        } // end drillDown

        function matchSpecifier (list) {
          var i,
              len = list.length,
              specifier,
              rx = new RegExp(filter);

          for (i = 0; i < len; i += 1) {
            specifier = list[i][getter];

            if (rx.test(specifier)) {
              filtered_nodes.push(list[i]);
            }
          }
        } // end matchSpecifier

        if (/className|id/.test(getter)) {
          matchSpecifier(list);
        }
        else {
          drillDown(list);
        }

        scope = storeUniques(filtered_nodes);
        return scope;
      } // end filterHTMLCollection

      function selectFromString (slctr) {
        var slctr_array = slctr.split(','),
            parsed = [],
            i,
            j;

        function select (s) {
          var tokens = s.match(/[a-zA-Z0-9_-]\.[a-zA-Z0-9_-]|\s+\.|^\.|[a-zA-Z0-9_-]#[a-zA-Z0-9_-]|\s+#|^#|\s+|\./g) || [],
              flags = s.split(/\s+|\.|#/g) || [],
              filtered = [],
              i;
          
          // remove any empty strings Array.split might have added
          for (i = 0; i < flags.length; i += 1) {
            if (flags[i].length) {
              filtered.push(flags[i]);
            }
          }
          flags = filtered;

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

            // put singular DOM references, but not HTMLCollections, in an array
            // filterHTMLCollection always stores its results in a true array
            if (typeof scope.length === 'undefined') {
              scope = [scope];
            }
            filterHTMLCollection(scope, getter, flags[i]);

          } // end tokens/flags loop

        } // end select

        if (slctr_array.length > 1) {
          for (i = 0; i < slctr_array.length; i += 1) {
            scope = document; // needs resetting for each call
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
        if (!selectr.length) { selectr = [selectr] };
        scope = selectr;
      }

      return scope;
    } // end selectElements

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
        instance[i].bWid = generateId();
        instance.length = (i + 1);
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
          if (func.fid && /listenFor|stopListening/.test(func.fid)) {
            args_array.unshift(i);
            remove = 2;
          }
          args_array.unshift(this[i]);
          func.apply(this, args_array);
          args_array.splice(0, remove);
        }

        return this;
      }, // end bW.all

      first : function () {
        return this.wrap(this[0]);
      }, // end bW.first

      parseArray : function () {
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
      }, // end bW.parseArray

      // ### METHODS THAT OPERATE ON ALL ELEMENTS IN THE SET and return the bW object
      css : function (prop, value) {
        if (!prop) { return this; }

        function setCSS (elem, prop, value) {
          elem.style[prop] = value;
        }

        return this.all(setCSS, arguments);
      }, // end bW.css

      addClass : function () {
        var args = this.parseArray(arguments);

        function setClass (elem) {
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
        } // end setClass

        return this.all(setClass, args);
      }, // end bW.addClass

      removeClass : function () {
        var args = this.parseArray(arguments);

        function setClass (elem) {
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
        } // end setClass

        return this.all(setClass, args);
      }, // end bW.removeClass

      listenFor : function (evt, func, capt, aargs) {

        function listen (elem, ndx, evt, func, capt, aargs) {
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
            instance.event_registry[ndx] = {};
            instance.event_registry[ndx][evt] = {
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
        listen.fid = 'listenFor';

        return this.all(listen, arguments);
      }, // end bW.listenFor

      stopListening : function (evt, func) {
        var instance = this;

        function dontListen (elem, ndx, evt, func, capt) {

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
              delete instance.event_registry[ndx][evt];
              for (key in instance.event_registry[ndx]) {
                count += 1
              }
              instance.event_registry.length = count;

              if (count === 0) {
                delete instance.event_registry[ndx];
              }
            }
          } // end unregister

          remove();
          unregister();
        } // end dontListen
        dontListen.fid = 'stopListening';

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

      initForm : function (submit_selector, suffix) {
        var form = this[0],
            submit,
            form_obj,
            prop,
            form_proto = {},
            f;

        if (!submit_selector) {
          throw new Error('bW.initForm should be invoked with a selector for a submit button.');
        }
        else {
          submit = selectElements(submit_selector)[0];
        }

        function BigwheelForm (form_element, submit_button, class_suffix) {
          var instance = this,
              fclass;

          instance[0] = form_element;
          instance.submit_button = submit_button;
          instance.length = 1;
          instance.data = {};

          if (class_suffix) {
            fclass = 'bW-form-' + class_suffix;
            if (!/fclass/.test(form.className)) {
              form.className = fclass;
            }
            fclass = 'bW-submit-' + class_suffix;
            if (!/fclass/.test(submit.className)) {
              submit.className = fclass;
            }
          }
        }

        // ### BigwheelForm prototype needs all the Bigwheel.prototype methods ###
        for (prop in Bigwheel.prototype) {
          form_proto[prop] = Bigwheel.prototype[prop];
        }

        f = BigwheelForm.prototype = form_proto;

        f.collectFields = function () {
          var instance = this,
              fields;

          f.fields = fields;
          return instance;
        } // end BigwheelForm.collectFields

        f.setRequiredFields = function () {
          var instance = this,
              i;

          f.required_fields = f.required_fields || [];

          for (i = 0; i < arguments.length; i += 1) {
            f.required_fields.push(arguments[i]);
          }

          return instance;
        } // end BigwheelForm.setRequiredFields

        f.addToTests = function (test) {
          f.tests = f.tests || [];
          f.tests.push(test);
        }

        f.lawyer = function () {
          console.log('Don\'t let my wife marry a lawyer.');
          return this;
        }

        f.init = function () {
          var instance = this;
        } // end BigwheelForm.init
        // ### end BigwheelForm prototype ###

        bW.forms.push(form_obj = new BigwheelForm(form, submit));
        return form_obj;
      } // end bW.initForm

    } // end Bigwheel prototype

    return new Bigwheel(selectElements(selector));

  }; // end bW selector engine and constructor

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return bW;
    });
  }

  return bW;

}());

console.log('I can take you there. Just follow me.');
