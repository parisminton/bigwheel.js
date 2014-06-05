/* 
 * > bigwheel.js 0.2.1 <
 *
 * My go-to JavaScript functions.
 * 
 * james@da.ydrea.ms
 *
 */

(function () {

  var bW = (typeof window.bW === 'object') ? window.bW : {};

  // ### event handler helpers

  bW.select = function (selector) {
    var elements = [],
        bWObj = {},
        scope = document,
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
    return scope;
  } // end bW core selector

  bW.event_registry = {
    count : 0
  }; // end event_registry
  
  
  bW.listenFor = function (elem, evt, func, capt, aargs) {
    var proc_id;
    
    // W3C-compliant browsers
    if (elem.addEventListener) {
      bW.evts.listener_model = "addEventListener";
      elem.addEventListener(evt, func, capt);
    }
    // IE pre-9
    else {
      if (elem.attachEvent) { 
        bW.evts.listener_model = "attachEvent";
        elem.attachEvent(("on" + evt), func);
      }
      // fall back to DOM level 0
      else { 
        bW.evts.listener_model = "onevent";
        elem["on" + evt] = func;
      }
    }
    
    // store these values in a registry, so we can retrieve them
    proc_id = ("process" + (this.registry.count + 1)); // unique id
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
  }
 
  /*
    {
    
    evts : {
    
      ,
      
      // reclaim the memory used by attaching the listeners
      stopListening : function (elem, evt, func, capt) {
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
      },
      
      // detach a bunch of listeners. if there are listeners, this should really be fired on every window unload
      stopAllListeners : function () {
        for (key in this.registry) {
          if (key != 'count') { // ignore the \'count\' variable
            this.stopListening(this.registry[key].elem, this.registry[key].evt, this.registry[key].func, this.registry[key].capt);
            delete this.registry[key];
            this.registry.count =- 1;
          };
        };
      },
      
      registry : { count : 0 },
      
      // a helper to make the event identifying more compact in each function that would use a listener
      identify : function (evt) {
        evt = evt || window.event;
        evt.src = evt.target || evt.srcElement;
        return evt;
      },
      
      // retrieve the additional arguments from the registry
      getAargs : function (func_ref, evt_type) {
        var proc_id = func_ref.reg_ids[evt_type];
        return bW.evts.registry[proc_id].aargs;
      },
      
      // override the default \'href\' destination on an \<a\> tag
      cancelAnchorDefault : function () {
        return false;
      }
    },// end evts object
    

//

    // DOM helpers
    dom : {
      
      count : 0, // generic, non-global counter for use outside of functions
      
      // return a node closer to the root of the DOM using one farther away
      descendTree : function (elem, ancestor) {
        if (elem.nodeName == ancestor) {
          return elem;
        }
        else {
          if (elem.parentNode) {
            bW.dom.descendTree(elem.parentNode, ancestor);
          }
        }
      }      
    },// end dom object
    


    // nav helpers
    nav : {
      
      goHome : function () {
          window.location = "/";
      }
      
    },// end nav object



    imgs : {
      
      preload : function (path) {
        var images = [],
            args = [],
            i,
            len = arguments.length,
            shortname,
            the_image;
        if (len == 2 && typeof arguments[1] == "object") {
          for (key in arguments[1]) {
            args.push(arguments[1][key]);
          }
        }

        else {
          for (i = 0; i < (len - 1); i += 1) {
            args[i] = arguments[(i + 1)];
          }
        }
        len = args.length;
        for (i = 0; i < len; i += 1) {
          shortname = bW.strings.getFileName(bW.styles.getStyle(args[i], "backgroundImage"));
          the_image = new Image();
          the_image.src = path + shortname;
          images.push(the_image);
          // for togglers
          if (shortname.match(/_off\.|_on\./)) {
            the_image = new Image();
            the_image.src = path + bW.strings.toggler(shortname);
            images.push(the_image);
          }
        }
      },
      
      toggleBg : function (evt) {
        var ev = bW.evts.identify(evt),        
            image_path = bW.styles.getStyle(ev.src, "backgroundImage").split(/_off\.|_on\./),
            suffix;
        
        if (ev.src.nodeName == "UL") {
          if (ev.type == "mouseover") {
            suffix = "_on.";
          }
          else {
            suffix = "_off.";
          }
          
          ev.src.style.backgroundImage = image_path[0] + suffix + image_path[1];
    
        }
      },
      
      toggleNavBg : function (evt) {
        var ev = bW.evts.identify(evt),        
            image_path = bW.styles.getStyle(ev.src.parentNode, "backgroundImage").split(/_off\.|_on\./),
            suffix,
            page = document.getElementsByTagName("body")[0].id.replace("-page", "");
        if (ev.src.nodeName == "A") {
          if (ev.type == "mouseover") {
            suffix = "_on.";
          }
          if (ev.type == "mouseout") {
            suffix = "_off.";
          }
          if (ev.src.parentNode.id.indexOf(page) == -1) {
            ev.src.parentNode.style.backgroundImage = image_path[0] + suffix + image_path[1];
          }
        }
      },
      
      toggleSprite : function (evt) {
        var ev = bW.evts.identify(evt),
            aargs = bW.evts.getAargs(bW.imgs.toggleSprite, ev.type);
        if (ev.type == "mouseover") {
          ev.src.style.backgroundPosition = aargs[0][0] + " " + aargs[0][1];
        }
        if (evt.type == "mouseout") {
          ev.src.style.backgroundPosition = aargs[1][0] + " " + aargs[1][1];
        }
      }
    }, // end image object
    
    // style retreival
    styles : {

      // figure out which method of reporting DOM styles the browser is using
      getStyleModel : function () {
        var ghost = document.createElement("div"),
            bod = document.getElementsByTagName("body")[0];
            // bod.appendChild(ghost);
        if (document.defaultView && document.defaultView.getComputedStyle) {
          bW.env.style_model = "getComputedStyle";
          bW.styles.getStyle = function (elem, prop) {
            return document.defaultView.getComputedStyle(elem, null).getPropertyValue(bW.styles.cssProps[prop]); 
          };
        }
        else if (ghost.currentStyle) {
          bW.env.style_model = "currentStyle";
          bW.styles.getStyle = function (elem, prop) {
            return elem.currentStyle[prop]; 
          };
        }
        ghost = null;
      },
      
      cssProps : {
        background : "background",
        backgroundAttachment : "background-attachment",
        backgroundColor : "background-color",
        backgroundImage : "background-image",
        backgroundPosition : "background-position",
        backgroundPositionX : "backgroundPositionX",
        backgroundPositionY : "backgroundPositionY",
        backgroundRepeat : "background-repeat",
        border : "border",
        borderBottom : "border-bottom",
        borderBottomColor : "border-bottom-color",
        borderBottomStyle : "border-bottom-style",
        borderBottomWidth : "border-bottom-width",
        borderCollapse : "border-collapse",
        borderColor : "border-color",
        borderLeft : "border-left",
        borderLeftColor : "border-left-color",
        borderLeftStyle : "border-left-style",
        borderLeftWidth : "border-left-width",
        borderRight : "border-right",
        borderRightColor : "border-right-color",
        borderRightStyle : "border-right-style",
        borderRightWidth : "border-right-width",
        borderSpacing : "border-spacing",
        borderStyle : "border-style",
        borderTop : "border-top",
        borderTopColor : "border-top-color",
        borderTopStyle : "border-top-style",
        borderTopWidth : "border-top-width",
        borderWidth : "border-width",
        bottom : "bottom",
        captionSide : "caption-side",
        clear : "clear",
        clip : "clip",
        color : "color",
        content : "content",
        counterIncrement : "counter-increment",
        counterReset : "counter-reset",
        cursor : "cursor",
        direction : "direction",
        display : "display",
        font : "font",
        fontFamily : "font-family",
        fontSize : "font-size",
        fontSizeAdjust : "font-size-adjust",
        fontStretch : "font-stretch",
        fontStyle : "font-style",
        fontVariant : "font-variant",
        fontWeight : "font-weight",
        height : "height",
        left : "left",
        letterSpacing : "letter-spacing",
        lineHeight : "line-height",
        listStyle : "list-style",
        listStyleImage : "list-style-image",
        listStylePosition : "list-style-position",
        listStyleType : "list-style-type",
        margin : "margin",
        marginBottom : "margin-bottom",
        marginLeft : "margin-left",
        marginRight : "margin-right",
        marginTop : "margin-top",
        maxHeight : "max-height",
        maxWidth : "max-width",
        minHeight : "min-height",
        minWidth : "min-width",
        opacity : "opacity",
        orphans : "orphans",
        outline : "outline",
        outlineColor : "outline-color",
        outlineStyle : "outline-style",
        outlineWidth : "outline-width",
        overflow : "overflow",
        padding : "padding",
        paddingBottom : "padding-bottom",
        paddingLeft : "padding-left",
        paddingRight : "padding-right",
        paddingTop : "padding-top",
        pageBreakAfter : "page-break-after",
        pageBreakBefore : "page-break-before",
        pageBreakInside : "page-break-inside",
        position : "position",
        quotes : "quotes",
        right : "right",
        tableLayout : "table-layout",
        textAlign : "text-align",
        textDecoration : "text-decoration",
        textIndent : "text-indent",
        textShadow : "text-shadow",
        textTransform : "text-transform",
        top : "top",
        unicodeBidi : "unicode-bidi",
        verticalAlign : "vertical-align",
        visibility : "visibility", 
        whiteSpace : "white-space",
        widows : "widows",
        width : "width",
        wordSpacing : "word-spacing",
        wordWrap : "word-wrap",
        zIndex : "z-index"
      },
    }, // end styles object
    
    // string manipulation
    strings : {
      getFileName : function (string) {
        var filename,
            index1 = (string.lastIndexOf("/") + 1),
            index2,
            bookend = /\"\)|\)/;
        if (string.search(bookend) != -1) {
          index2 = string.search(bookend);
          filename = string.substring(index1, index2);
        }   
        else {
          filename = string.substring(index1);
        }   
        return filename;
      },
      
      toggler : function (filename) {
        var find = /_off\.|_on\./,
            match = filename.match(find),
            suffix,
            new_filename,
            split_array;
        if (match == "_off.") {
          suffix = "_on.";
        }
        else {
          suffix = "_off.";
        }
        split_array = filename.split(match);
        new_filename = split_array[0] + suffix + split_array[1];
        return new_filename;
      },

      // handy for converting CSS attributes to their style object properties
      hyphenToCamelCase : function (string) {
        var i, len, split_array; 
        if (string.indexOf("-") == -1) {
          return string;
        }
        split_array = string.split("-");
        len = split_array.length;
        for (i = 1; i < len; i += 1) {
          split_array[i] = split_array[i].replace(split_array[i].charAt(0), split_array[i].charAt(0).toLocaleUpperCase());
        }
        return split_array.join("");
      }
    }, // end string object
    


    // an object for environment-specific functions, like element references and convenience variables; if the rest of this file is mostly helpers from the library that change very little and can be reused, this area will contain most of the distinct functions and variables for a specific page
    env : {
      
      // is a recursive scroll function currently firing? false by default
      autoscrolling : false, 
    
      // has there been recent scroll? false by default
      recentscroll : false,
      
      // give a one-second window before firing any onscroll event functions.
      scrollAlert : function () {
        bW.env.recentscroll = true;
        var wait = setTimeout(bW.env.scrollAlertOff, 1000);
      },
      
      scrollAlertOff : function () {
        bW.env.recentscroll = false;
      },
      
      checkScroll : function () {
        return recentscroll;
      },
      
      toon : document.getElementById('toon'),
    
      buttons : {},
      
      slider : document.getElementById('about'),
      
      current : 'nav-carousel', // the current territory; carousel by default
      
      // change bW.env.current when the reader clicks a button. this affects the calculations in scrollBg() and slide()
      update : function (evt) {
        var ev = bW.evts.identify(evt),
            key = ev.src.parentNode.parentNode.id;
        
        bW.env.current = key;
        return key;
      },
      
      // populate that empty buttons object; we want to store the reference to the corresponding button, the string scrollBg() uses to determine the destination territory, the yoffset value where the territory begins, and the background position of the slider arrow for each button
      setup : function () {
        var refs = [
              document.getElementById('nav-about'),
              document.getElementById('nav-work'),
              document.getElementById('nav-contact')
            ],
            len = refs.length,
            i;
        
        for (i = 0; i < len; i +=1) {
          
          // deep object population in a loop for the sake of your own sanity, please, please save this somewhere and reuse it
          bW.env.buttons[refs[i].id] = {
            elem : refs[i],
            // the distance between each point is 150 pixels, starting at 50
            position : (((i + 1) * 150) - 100)
          };
        }
        bW.env.buttons['nav-carousel'].dest = 'carouselanchor';
        bW.env.buttons['nav-balloon'].dest = 'balloonanchor';
        bW.env.buttons['nav-widgetry'].dest = 'widgetanchor';
      },
      
      // divide the screen into \'territories\', so that scrolling into one from another can trigger an event, like slideBg()
      drawTerritories : function () {
        for (key in bW.env.buttons) {
          bW.env.buttons[key].territory = (bW.motion.getDestYOffset(bW.env.buttons[key].dest) - 200);
        }
      },
      
      // now check those territories. we\'ll likely fire this from an event
      checkTerritories : function () {
        
        if (!bW.env.autoscrolling) { // don\'t fire during a recursive scroll
          var curr_pos = bW.motion.getCurrYOffset(),
              wait;
  
          if (curr_pos < bW.env.buttons['nav-balloon'].territory - 100) {
            bW.env.current = 'nav-carousel';
          }
          else if (curr_pos > bW.env.buttons['nav-carousel'].territory - 100 &&
              curr_pos < bW.env.buttons['nav-widgetry'].territory - 150) {
            bW.env.current = 'nav-balloon';
          }
          else if (curr_pos > (bW.env.buttons['nav-widgetry'].territory - 150)) {
            bW.env.current = 'nav-widgetry';
          }
          bW.motion.slideBg();
        }
      }
    
    },// end env object


    // motion helpers
    motion : {
    
      // helpers for scrollPage and drawTerritories
      getCurrYOffset : function () {
        // W3C-compliant browsers
        if (self.pageYOffset) {
          return self.pageYOffset;
        };
        
        // IE6 standards mode
        if (document.documentElement && document.documentElement.scrollTop) {
          return document.documentElement.scrollTop;
        };
        
        // IE6, 7 and 8
        if (document.body.scrollTop) {
          return document.body.scrollTop;
        };
        
        // else we can\'t help you
        return 0;
      },
      
      
      getDestYOffset : function (the_id) {
        var the_element = document.getElementById(the_id),
            y_pos = the_element.offsetTop,
            node = the_element;
        while (node.offsetParent && node.offsetParent != document.body) {
          node = node.offsetParent;
          y_pos += node.offsetTop;
        };
        return y_pos;
      },
      
      
      scrollPage : function () {
        
        // for an explanation of the math, see slideBg()
        var the_id = bW.env.buttons[bW.env.current].dest,
            curr_pos = bW.motion.getCurrYOffset(),
            dest = bW.motion.getDestYOffset(the_id),
            distance = (dest > curr_pos) ? (dest - curr_pos) : (curr_pos - dest),
            speed = Math.round(distance / 100),
            inc = Math.round(distance / 25),
            leap = (dest > curr_pos) ? (curr_pos + inc) : (curr_pos - inc),
            timer = 0,
            scr = function () {
              window.scrollTo(0, leap);
            };
        
        bW.env.autoscrolling = true; // still in the process of scrolling
        
        if (distance < 100) {
          window.scrollTo(0, dest);
          bW.env.autoscrolling = false;
          return false;
        };
        if (speed >= 20) {
          speed = 20;
        }
        if (dest > curr_pos) {
          for (var i = curr_pos; i < dest; i += inc ) {
          
            // i don\'t like the compiled method of setTimeout, but i haven\'t figured out a solution yet scr() on line 164 doesn\'t work yet // here and below, we add 130 pixels to give room for the fixed nav bar at the top of the screen
            setTimeout('window.scrollTo(0, ' + (leap - 130) + ')', timer * speed);
            leap += inc;
            if (leap > dest) {
              leap = dest;
            };
            timer++;
          };
          bW.env.autoscrolling = false; // done scrolling
          return false;
        };
        for (var i = curr_pos; i > dest; i -= inc ) {
          setTimeout('window.scrollTo(0, ' + (leap - 130) + ')', timer * speed);
          leap -= inc;
          if (leap < dest) {
            leap = dest;
          };
          timer++;
        };
        bW.env.autoscrolling = false; // done scrolling
        return false;
      },
      
      // a tester for reading the yoffset value
      compass : function () {
        console.log(bW.motion.getCurrYOffset());
      },
     
      
      // is a recursive slider function firing? false by default
      sliding : false,
      
      expandElem : function() {
        bW.motion.slide("height", false, false);
      },
      
      slide : function (prop, horizontal, twodimensions) {
        var slider = bW.env.slider,
            dest = bW.env.buttons[bW.env.current].position,
            curr_pos, distance, inc, wait;

        // get the value of the background image\'s current left position.	
       
        // the style model is now picked at load time. we can test for bW.env.style_model


        // FF, Safari, IE7, 8, and Opera
        if (document.defaultView && document.defaultView.getComputedStyle) {
          curr_pos = parseInt(document.defaultView.getComputedStyle(slider, null).getPropertyValue(smProperties[style_model][prop]));
        }
        else if (slider.currentStyle) {
          // IE pre-9
          curr_pos = parseInt(slider.currentStyle[smProperties[style_model][prop]]);
        }
        else {
          return false;
        }

        // if the current position equals the destination, exit
        if (curr_pos == dest) {
          bW.motion.sliding = false;
          return true;
        }
        
        // if the current position doesn't exist, set it to zero
        if (!curr_pos || curr_pos == '' || isNaN(curr_pos)) {
          curr_pos = 0;
        }
        
        // calculate the distance between the current position and destination
        distance = (dest - curr_pos);

        // if the difference is negative, make it positive
        if (distance < 0) {
          distance = (0 - distance);
        }
        
        // calculate a fraction of that distance..
        inc = Math.ceil(distance / 5);
      
        bW.motion.sliding = true;
        // if the current position is less than the destination, slide the background image forward
        if (curr_pos < dest) {
          curr_pos += inc;
          slider.style[prop] = curr_pos + 'px 98px';
        }
        
        // if the current position is greater than the destination, slide the background image backward
        else {
          curr_pos -= inc;
          slider.style[prop] = curr_pos + 'px 98px';
        }
        
        // repeat until the current position equals the destination
        wait = setTimeout(bW.motion.slide, 50);
      },
  
      slideBg : function () {
        var slider = bW.env.slider,
            dest = bW.env.buttons[bW.env.current].position,
            curr_pos, distance, inc, wait;

        // get the value of the background image\'s current left position		
        
        // FF, Safari, IE7, 8, and Opera 
        if (document.defaultView.getComputedStyle) {
          curr_pos = parseInt(document.defaultView.getComputedStyle(slider, null).getPropertyValue('background-position'));
        }
        else if (slider.currentStyle) {
          // IE pre-9
          curr_pos = parseInt(slider.currentStyle.backgroundPositionX);
        }
        else {
          return false;
        }

        // if the current position equals the destination, exit
        if (curr_pos == dest) {
          bW.motion.sliding = false;
          return true;
        }
        
        // if the current position doesn't exist, set it to zero
        if (!curr_pos || curr_pos == '' || isNaN(curr_pos)) {
          curr_pos = 0;
        }
        
        // calculate the distance between the current position and destination
        distance = (dest - curr_pos);

        // if the difference is negative, make it positive
        if (distance < 0) {
          distance = (0 - distance);
        }
        
        // calculate a fraction of that distance..
        inc = Math.ceil(distance / 5);
      
        bW.motion.sliding = true;
        // if the current position is less than the destination, slide the background image forward
        if (curr_pos < dest) {
          curr_pos += inc;
          slider.style.backgroundPosition = curr_pos + 'px 98px';
        }
        
        // if the current position is greater than the destination, slide the background image backward
        else {
          curr_pos -= inc;
          slider.style.backgroundPosition = curr_pos + 'px 98px';
        }
        
        // repeat until the current position equals the destination
        wait = setTimeout(bW.motion.slideBg, 50);
      }
    
    }, // end motion object

    
    // window calculations
    viewport : {
      
      // core code from http://www.quirksmode.org
      getPageSize : function() {
		  	var scroll_x,
            scroll_y,
            window_width,
            window_height,
            page_width,
            page_height;
		  	if (window.innerHeight && window.scrollMaxY) {	
		  		scroll_x = window.innerWidth + window.scrollMaxX;
		  		scroll_y = window.innerHeight + window.scrollMaxY;
		  	}
		  	else if (document.body.scrollHeight > document.body.offsetHeight) {
		  		scroll_x = document.body.scrollWidth;
		  		scroll_y = document.body.scrollHeight;
		  	}
		  	else {
		  		scroll_x = document.body.offsetWidth;
		  		scroll_y = document.body.offsetHeight;
		  	}
		  	
		  	if (self.innerHeight) {
		  		if (document.documentElement.clientWidth) {
		  			window_width = document.documentElement.clientWidth; 
		  		}
		  		else {
		  			window_width = self.innerWidth;
		  		}
		  		window_height = self.innerHeight;
		  	}
		  	else if (document.documentElement && document.documentElement.clientHeight) {
		  		window_width = document.documentElement.clientWidth;
		  		window_height = document.documentElement.clientHeight;
		  	}
		  	else if (document.body) {
		  		window_width = document.body.clientWidth;
		  		window_height = document.body.clientHeight;
		  	}	
		  	if (scroll_y < window_height) {
		  		page_height = window_height;
		  	}
		  	else { 
		  		page_height = scroll_y;
		  	}
      
		  	if (scroll_x < window_width) {	
		  		page_width = scroll_x;		
		  	}
		  	else {
		  		page_width = window_width;
		  	}
		  	return [page_width, page_height, window_width, window_height];
		  }
		}, // end viewport object
    
    // form processing
    forms : {
      swapCheckbox: function (elem) {
        if (elem) {
          var sp,
              clone = elem.cloneNode(true);
          clone.style.visibility = "hidden";
          sp = document.createElement("span");
          sp.id = "newcheckbox";
          sp.appendChild(clone);
          sp.clicked = false;
          bW.evts.listenFor(sp, "click", bW.forms.updateNewCheckbox, false, [bW.page.cb, bW.page.l]);
          bW.evts.listenFor(sp, "mouseover", bW.forms.updateNewCheckbox, false);
          bW.evts.listenFor(sp, "mouseout", bW.forms.updateNewCheckbox, false);
          elem.parentNode.replaceChild(sp, elem);
        }
      },
    
      updateNewCheckbox : function (evt) {
        if (document.forms["contact-form"]["contact-conf"]) {
          var // aargs,
              cb = document.forms["contact-form"]["contact-conf"],
              l = document.getElementById("conf");
              evt = bW.evts.identify(evt);
              // aargs = bW.evts.getAargs(bW.forms.updateNewCheckbox, evt.type);
          if (evt.type == "mouseover" && (!this.clicked)) {
            this.style.backgroundPosition = "-18px top";
          }
          if (evt.type == "mouseout" && (!this.clicked)) {
            this.style.backgroundPosition = "left top";
          }
          if (evt.type == "click") {
            if (!this.clicked) {
              this.clicked = true;
              this.style.backgroundPosition = "-36px top";
              cb.checked = true;
              l.firstChild.nodeValue = "A copy of this message will be sent to you.";
            }
            else {
              this.clicked = false;
              this.style.backgroundPosition = "left top";
              cb.checked = false; 
              l.firstChild.nodeValue = "Want a copy of this message?";
            }
          }
        }
      },
      
      placeholder : function (evt) {

        var default_val,
            evt = bW.evts.identify(evt);
        
        if (evt.src.id == "contact-name") {
          default_val = "Your name";
        }
        if (evt.src.id == "contact-email") {
          default_val = "Your e-mail address";
        }
        if (evt.src.id == "contact-msg") {
          default_val = "So... a penguin, Optimus Prime and Supreme Court Justice Sonia Sotomayor walk into a bar...";
        }
        
        if (evt.type == "focus") {
          if (evt.src.value == default_val) {
            evt.src.value = '';
            evt.src.style.color = "#666666";
          }
        }
        
        if (evt.type == "blur") {
          if (evt.src.value == '') {
            evt.src.value = default_val;
            evt.src.style.color = "#fff";
          }
        }
      },

      validate : function (evt) {
        var re,
            nonalpha,
            len,
            i,
            white = /\s/,
            tld = /\.[a-z]{2,4}$|\.museum$|\.travel$/i,
            evt = bW.evts.identify(evt),
            alert_msg = ["Please fix the following before sending this e-mail:\n"];
        if (evt.src.id == "contact-name") {
          re = /\W/;
          if (re.test(evt.src.value)) {
            nonalpha = re.exec(evt.src.value);
            i;
            len = nonalpha.length;
            for (i = 0; i < len; i += 1) {
              if (nonalpha[i] != " ") {
                alert_msg.push("  - Your name can only contain alphanumeric characters.");
              alert(alert_msg.join("\n"));
              break;
              }
            }
          }
        }
        
        if (evt.src.id == "contact-email") {
          re = /^[a-z0-9+._-]+@[a-z0-9.-]+\.[a-z]{2,4}$|^[a-z0-9+._-]+@[a-z0-9.-]+\.museum$|^[a-z0-9+._-]+@[a-z0-9.-]+\.travel$/i;
          if (!re.test(evt.src.value)) {
            if (white.test(evt.src.value)) {
              alert_msg.push("  - Your e-mail address can\'t contain any whitespace.");
            }
            if (evt.src.value.indexOf('@') == -1) {
              alert_msg.push("  - Your e-mail address must include one \"at\" sign \(@\).");
            }
            if (evt.src.value.indexOf('.') == -1) {
              alert_msg.push("  - Your e-mail address must include a period.");
            }
            if (evt.src.value.indexOf('.') != -1 && !tld.test(evt.src.value)) {
              alert_msg.push("  - The top-level domain of your e-mail address \(everything after the last period\) needs fixing. It should be between two and four letters long, or the terms \"museum\" or \"travel\".");
            }
            alert(alert_msg.join("\n"));
          }
        }
      }
    }
  */ 

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return bW;
    });
  }

  return bW;

}());

console.log("I can take you there. Just follow me.");
