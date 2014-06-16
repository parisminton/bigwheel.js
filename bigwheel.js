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
        getter,
        instance;

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
    }

    Bigwheel.prototype = {
      event_registry : { count : 0 },

      listenFor : function (elem, evt, func, capt, aargs) {
        var proc_id;
        
        // W3C-compliant browsers
        if (elem.addEventListener) {
          if (!this.listener_model) { this.listener_model = 'addEventListener'; }
          elem.addEventListener(evt, func, capt);
        }
        // IE pre-9
        else {
          if (elem.attachEvent) { 
            if (!this.listener_model) { this.listener_model = 'attachEvent'; }
            elem.attachEvent(('on' + evt), func);
          }
          // fall back to DOM level 0
          else { 
            if (!this.listener_model) { this.listener_model = 'onevent'; }
            elem['on' + evt] = func;
          }
        }
        
        // store these values in a registry, so we can retrieve them
        proc_id = ('process' + (this.registry.count + 1)); // unique id
        this.registry[proc_id] = {};
        this.registry[proc_id].elem = elem;
        this.registry[proc_id].evt = evt;
        this.registry[proc_id].func = func;
        this.registry[proc_id].capt = capt;
        if (aargs) {
          this.registry[proc_id].aargs = aargs; // additional arguments
        }
        else { 
          this.registry[proc_id].aargs = [];
        }
        
        // add a property to the function itself that stores the event type. by referencing the event type, we can recall the process ID and retrieve any additional arguments.
        if (!func.reg_ids) {
          func.reg_ids = {};
        }
        func.reg_ids[evt] = proc_id;
        
        this.registry.count += 1; // store the total number of registered listeners
      }, // end listenFor

      stopListening : function () {
      }

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
