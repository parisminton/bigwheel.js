/* 
 * > bigwheel.js 0.4.0 <
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

            if (attr_array.length === 2) {
              scope = attr_array[0];
            }

            if (attr_array.length === 3) {
              scope = attr_array[1];
              attr = attr_array[2];
            }

            if (attr_array.length === 4) {
              attr = attr_array[1];
              token = attr_array[2];
              value = attr_array[3];
            }

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
      } // end bW.setForm

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
      instance.data = {};

      // ### bWF HELPERS  ###
      function bruiseField (field) {
        if (/TEXTAREA|SELECT/.test(field.nodeName)
          || /text|fieldset/.test(field.type)) {
          plusClass(field, 'bW-invalid-field');
        }
      } // end bruiseField

      function areFieldsEmpty () {
        var i,
            empty = false;

        for (i = 0; i < instance.required_fields.length; i += 1) {
          if (instance.required_fields[i].value === '') {
            bruiseField(instance.required_fields[i]);
            empty = true;
          }
        }
        if (empty) {
          // prepare error message
        }
        return empty;
      } // end areFieldsEmpty

      function collectValues () {
        var name;

        for (name in instance.fields) {
          instance.data[name] = instance.fields[name].value;
        }
      } // end collectValues

      function collect (name, callback) {
        var rx = /^function ([a-zA-Z_]*)\(.*\)/;

        if (typeof arguments[0] != 'string') {
          throw new Error('The first argument to BigwheelForm.collect should be a string-- the name of the collector function');
        }

        instance.collectors[name] = callback;
      } // end collect

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
          fields.splice(i, 1);
        }
        else {
          instance.fields[fields[i].name] = fields[i];
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
          data: f.JSONData,
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
        collectValues();
        areFieldsEmpty();
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

  }; // end bW selector engine and constructor

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return bW;
    });
  }

  return bW;

}());

console.log('I can take you there. Just follow me.');
