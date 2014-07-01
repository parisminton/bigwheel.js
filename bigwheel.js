/* 
 * > bigwheel.js 0.2.2 <
 *
 * My go-to JavaScript functions.
 * 
 * james@da.ydrea.ms
 *
 */

(function () {

  // ### TODO ... if bW exists, add this function to it as a property ###
  var bW = (typeof window.bW === 'function') ? window.bW : function (selector) {

    // ### bW selector engine and constructor ###
    var scope = document,
        getter;

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

    function selectFromString () {
      var tokens = selector.match(/[a-zA-Z0-9_-]\.[a-zA-Z0-9_-]|\s+\.|^\.|[a-zA-Z0-9_-]#[a-zA-Z0-9_-]|\s+#|^#|\s+|\./g) || [],
          flags = selector.split(/\s+|\.|#/g) || [],
          i, len;
      
      // remove any empty strings Array.split might have added
      flags = flags.filter(function (item) {
        if (item.length > 0) {
          return item;
        }
      }); // end flags.filter

      len = flags.length;

      if (tokens.length < flags.length) {
        tokens.unshift('tagname');
      }

      for (i = 0; i < len; i += 1) {

        if (/^\.|\s+\./.test(tokens[i])) {
          getter = 'getElementsByClassName';
        }

        if (/^#|\s+#/.test(tokens[i])) {
          getter = 'getElementById';
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

    } // end selectFromString

    if (typeof selector === 'string') {
      selectFromString();
    }

    function Bigwheel (elements) {
      var instance = this;

      elements.forEach(function (elem, ndx) {
        // methods need to apply these elements
        instance[ndx] = elem;
        instance.length = (ndx + 1);
      });
      
      instance.selector = selector;
    } // end Bigwheel constructor

    Bigwheel.prototype = {
      all : function (func, args) {
        var args_array = [],
            i;

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
          args_array.shift();
        }

        return this;
      }, // end bW.all

      event_registry : { length : 0 },

      css : function (prop, value) {
        if (!prop) { return this; }

        function setCSS (elem, prop, value) {
          elem.style[prop] = value;
        }

        return this.all(setCSS, arguments);
      }, // end bW.css

      listenFor : function (evt, func, capt, aargs) {

        function listen (elem, evt, func, capt, aargs) {
          var bWObj = this;

          function add () {
            // W3C-compliant browsers
            if (elem.addEventListener) {
              if (!bWObj.listener_model) { bWObj.listener_model = 'addEventListener'; }
              elem.addEventListener(evt, func, capt);
            }
            // IE pre-9
            else {
              if (elem.attachEvent) { 
                if (!bWObj.listener_model) { bWObj.listener_model = 'attachEvent'; }
                elem.attachEvent(('on' + evt), func);
              }
              // fall back to DOM level 0
              else { 
                if (!bWObj.listener_model) { bWObj.listener_model = 'onevent'; }
                elem['on' + evt] = func;
              }
            }
          } // end add

          // store these values in a registry, so we can retrieve them
          function register () {
            var proc_id;

            proc_id = (bWObj.event_registry.length); // unique id
            // ### more valuable for the key to be a unique ID or the event type string?
            bWObj.event_registry[proc_id] = {
              elem : elem,
              evt : evt,
              func : func,
              capt : capt,
              aargs : aargs
            };
            
            // store the process ID in the function itself, using the event type as a key. for retrieving any additional arguments.
            if (!func.reg_ids) {
              func.reg_ids = {};
            }
            func.reg_ids[evt] = proc_id;
            bWObj.event_registry.length += 1;
          } // end register

          add();
          register();
        } // end listen

        return this.all(listen, arguments);
      }, // end bW.listenFor

      stopListening : function () {
      }, // end bW.stopListening

      before : function (elem) {
        function insert (after, elem) {
          after.parentNode.insertBefore(elem, after);
        }

        return this.all(insert, arguments);
      } // end bW.before

    } // end Bigwheel prototype

    return new Bigwheel(scope);

  }; // end bW selector engine and constructor

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return bW;
    });
  }

  return bW;

}());

console.log('I can take you there. Just follow me.');
