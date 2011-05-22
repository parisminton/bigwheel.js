(function () {

  this.bW = {
  
    // event handler helpers
    evts : {
    
      listenFor : function (node, evt, func, capt, aargs) {
        var proc_id;
        if (node.addEventListener) {
          node.addEventListener(evt, func, capt);
        }
        else {
          evt = "on" + evt;
          if (node.attachEvent) {
            node.attachEvent(evt, func);
          }
          else {
            node[evt] = func;
          }
        }
        proc_id = ("process" + (this.registry.count + 1));
        this.registry[proc_id] = {};
        this.registry[proc_id].node = node;
        this.registry[proc_id].evt = evt;
        this.registry[proc_id].func = func;
        this.registry[proc_id].capt = capt;
        this.registry[proc_id].aargs = aargs;
        
        if (!func.reg_ids) {
          func.reg_ids = [];
        }
        func.reg_ids.push(proc_id);
        
        this.registry.count += 1;
        alert('Friendly Fires.');
      },
      
      stopListening : function (node, evt, func, capt) {
        if (node.removeEventListener) {
          node.removeEventListener(evt, func, capt);
        }
        else {
          evt = 'on' + evt;
          if (node.detachEvent) {
            node.detachEvent(evt, func);
          }
          else {
            node[evt] = null;
          }
        }
      },
      
      registry : { count : 0 },
      
      identify : function (evt) {
        evt = evt || window.event;
        evt.src = evt.target || evt.srcElement;
        return evt;
      }
    },
    
    imgswaps : {
    
      // only needs to fire only once, as soon as toggle locations are known 
      preload : function (path) {
        var images = [],
            i = 0,
            len = arguments.length;      
        if (len == 2 && typeof arguments[1] == "array") {
          len = arguments[1].length;
          for (i; i < len; i += 1) {
            arguments[i] = arguments[1][i];
          }
          len = arguments.length;
        }
        for (i; i < len; i += 1) {
          images[i] = new Image();
          images[i].src = path + arguments[(i + 1)];
        }
      },
      
      toggleBg : function (evt) {
        var ev = bW.evts.identify(evt),        
            image_path = bW.styles.getStyle(ev.src.parentNode, "background-image", "backgroundImage").split(/_off\.|_on\./),
            suffix;
        
        if (ev.src.nodeName == "A") {
          if (ev.type == "mouseover") {
            suffix = "_on.";
          }
          else {
            suffix = "_off.";
          }
          
          ev.src.parentNode.style.backgroundImage = image_path[0] + suffix + image_path[1];
    
        };
      }
    },
    
    // style retreival
    styles : {
      getStyle : function (elem, dom_prop, ie_prop) {
        if (window.getComputedStyle) {
          return window.getComputedStyle(elem, null).getPropertyValue(dom_prop);
        }
        else if (elem.currentStyle) {
          return elem.currentStyle[ie_prop];
        }
      }
    },
    
    // string manipulation
    strings : {
      toggler : function (filename) {
        var separator = /_off\.|_on\./;
        str_array = filename.split(separator);
      }
    }
  };

}());