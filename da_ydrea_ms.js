    /* ...this use of the arguments array was smart! or so I think... */
    function populatePhotoObjArray(array_name) {
	    for (var i = 0; i < (arguments.length - 1); i++) {
	    	array_name[array_name.length] = arguments[i + 1];
	    	array_name[arguments[i + 1].name] = array_name[i];
	    	array_name[arguments[i + 1].name].position = i * 550;
	    };
    };


    function slide(dest) {
      var port_items = document.getElementById('port-strip'),
          curr_pos, distance, inc, wait;
      
      /* get the absolute value of the photo strip\'s current top position... */		
      if (port_items.currentStyle) {
      	
      	/* ...IE6... */
      	curr_pos = (0 - parseInt(port_items.currentStyle.top));
      }
      /* ...FF, Safari, IE7, 8, and Opera... */ 
      else if (document.defaultView.getComputedStyle) {
      	curr_pos = (0 - parseInt(document.defaultView.getComputedStyle(port_items, null).getPropertyValue('top')));
      }
      else {
      	return false;
      }
      
      /* ... if the current position equals the destination, exit... */
      if (curr_pos == dest) {
      	return true;
      }
      
      /* ... if the current position doesn't exist, set it to zero... */
      if (!curr_pos || curr_pos == '' || isNaN(curr_pos)) {
      	curr_pos = 0;
      }
      
      /* ... calculate the distance between the current position and destination... */
      distance = (dest - curr_pos);
      
      /* ... if the difference is negative, make it positive... */
      if (distance < 0) {
      	distance = (0 - distance);
      }
      
      /* ...calculate a fraction of that distance.. */
      inc = Math.ceil(distance / 5);
    
      /* ... if the current position is less than the destination, slide the strip forward... */
      if (curr_pos < dest) {
      	curr_pos += inc;
      	port_items.style.top = '-' + curr_pos + 'px';
      }
      
      /* ... if the current position is greater than the destination, slide the strip backward... */
      else {
      	curr_pos -= inc;
      	port_items.style.top = '-' + curr_pos + 'px';
      }
      
      /* ... repeat until the current position equals the destination... */
      wait = setTimeout('slide(photoObj_array["photo_positions"][currentphoto])', 50);
    }