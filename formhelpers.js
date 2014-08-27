window.NYTINT = window.NYTINT || {};
NYTINT.forms = NYTINT.forms || {} ;

$(document).ready(function () {

  var f = NYTINT.forms;

  f.addToTests = function (test) {
    f.tests = f.tests || [];
    f.tests.push(test);
  }

  // ### does this need to be stored? ###
  f.default_image_source = $('.nytint-callout-form-pick').data('defaultsource');

  f.textLimitMonitor = function (textfield, message_node, limit, ndx) {
    var over_limit = false,
        ndx = (ndx) ? ndx : 0;
    
    textfield = $(textfield).eq(ndx);
    message_node = $(message_node);

    function addToOverLimitFields (comparator) {
      var i,
          len;

      if (!over_limit) { // avoid looping unless necessary
        if (!f.over_limit_fields) {
          f.over_limit_fields = [];
          f.over_limit_fields.push(textfield);
          return; 
        }

        len = f.over_limit_fields.length;
        for (i = 0; i < len; i += 1) {
          if (f.over_limit_fields[i] == comparator) {
            return;
          }
        }
        f.over_limit_fields.push(textfield);
      }
    } // end addToOverLimitFields

    function removeFromOverLimitFields (comparator) {
      var i,
          len = (over_limit) ? f.over_limit_fields.length : 0;

      if (over_limit) { // avoid looping unless necessary
        for (i = 0; i < len; i += 1) {
          if (f.over_limit_fields[i] == comparator) {
            f.over_limit_fields.splice(i, 1);
          }
        }
      }
    } // end removeFromOverLimitFields

    textfield.on('keydown change', function () {
      var count,
          units;

      if (textfield.val()) {

        if (textfield.data('wordcount')) {
          count = textfield.val().split(' ').length;
          units = 'word';
        }
        else if (textfield.data('charactercount')) {
          count = textfield.val().length;
          units = 'character';
        }

        if (count < (limit -1) || count > (limit + 1)) {
          units += 's';
        }

        if (count < limit) {
          message_node.css('color', '#aaa').html('You have <strong>' + (limit - count) + '</strong> ' + units + ' left.');
          removeFromOverLimitFields(textfield);
         over_limit = false;
        }
        else if (count == limit) {
          message_node.css('color', '#6da014').html('You\'ve reached the limit of ' + limit + ' ' + units + 's.');
          removeFromOverLimitFields(textfield);
          over_limit = false;
        }
        else {
          message_node.css('color', 'red').html('You\'re <strong>' + (count - limit) + '</strong> ' + units + ' over the limit. You can\'t submit this form.');
          addToOverLimitFields(textfield);
          over_limit = true;
          return true;
        }
      }
    }); // end textfield handler

  } // end textLimitMonitor

  f.countText = function (evt) {
    var textfield = (typeof evt == 'object') ? $(evt.target) : $(evt),
        message_node,
        text_limit,
        unit;

    if (textfield.data('wordcount')) {
      unit = 'word';
    }
    if (textfield.data('charactercount')) {
      unit = 'character';
    }

    message_node = textfield.next('.nytint-textmonitor');
    text_limit = textfield.data(unit + 'count');

    f.textLimitMonitor(textfield, message_node, text_limit);
  } // end countText

  f.outsideTextLimit = function () {
    var i,
        len = (f.over_limit_fields) ?
              f.over_limit_fields.length : 0;

    if (len > 0) {
      for (i = 0; i < len; i += 1) {
        f.bruiseField(f.over_limit_fields[i])
      }
      f.addErrorMessage('Please shorten the text in the areas marked in red.');
      return true
    }
    else {
      return false;
    }
  } // end outsideTextLimit

  f.collectFields = function (form, required_fields, optional_fields) {
    var fields;

    // pre-load arguments here
    if (!form) {
      form = $('#nytint-callout-form');
    }

    var fields = $.map(required_fields, function (item) {
      return $(form).find(item).not(optional_fields);
    });
    $(fields).not('.submitphoto');

    f.fields = fields;
    return fields;
  } // end collectFields

  f.collectImagesAsJSON = function () {
    var image_obj,
        caption,
        credit;

    f.JSONData = f.JSONData || {};
    f.JSONData.images = [];

    $('.imageinfo').each(function (ndx, image) {
      image_obj = {};
      image_obj.url = $(image).data('url');
      caption = $(image).find('textarea.nytint-caption');
      if(caption.length > 0) {
        image_obj.caption = caption.val();
      }
      credit = $(image).find('input.nytint-credit');
      if(credit.length > 0) {
        image_obj.credit = $(image).find('input.nytint-credit').val();
      }
      image_obj.shortcut = $(image).data('shortcut');
      image_obj.service = $(image).data('service');
      if ($(image).data('service') != 'uploaded') {
        image_obj.username = $(image).data('username');
        image_obj.avatar = $(image).data('avatar');
      }
      f.JSONData.images.push(image_obj);
    });
  } // end collectImagesAsJSON

  f.collectValuesAsJSON = function (form) {
    var collection = { app : f.name },
        existing_data,
        ndx;

    if (f.JSONData) { existing_data = f.JSONData }

    $(form).find('[placeholder]').each(function () {
        var input = $(this);
        if (input.val() == input.attr('placeholder')) {
          input.val('');
        }
    });

    $(form + ' :input:visible').each(function (ndx, i) {
      if (i.type == 'submit' || i.name === undefined || i.name === "") {
        return;
      }
      else if (i.type == 'radio') {
        if (i.checked) {
          collection[i.name] = i.value;
        }
      }
      else if (i.type == 'checkbox') {
        if (!collection[i.name]) {
          collection[i.name] = [];
        }
        if (i.checked) {
          collection[i.name].push(i.value);
        }
      }
      else {
        collection[i.name] = i.value;
      }
    });

    // mix in the old stuff
    for (prop in existing_data) {
      if (!collection[prop]) {
        collection[prop] = existing_data[prop];
      }
    }

    f.JSONData = collection;
    return collection;
  } // end collectValuesAsJSON

  f.collectLocationDescriptionsAsFields = function () {
    var hidden_inputs = '';

    $('.nytint-location-desc').each(function (ndx, el) {
      hidden_inputs += '<input type="text" class="nytint-hiddenvalue" name="location[' + ndx + '][description]" val="' + $(el).val() + '">';
    });
    $('.nytint-location-report').append(hidden_inputs);
  } // end collectLocationDescriptionsAsFields

  f.collectLocationDescriptionsAsJSON = function () {
    if (f.JSONData.locations) {
      $('.nytint-location-desc').each(function (ndx, el) {
        f.JSONData.locations[ndx].description = $(el).val();
      });
    }
  } // end collectLocationDescriptionsAsJSON

  f.prepareErrorMessage = function (message) {
    return '<p>' + message + '</p>';
  } // end prepareErrorMessage

  f.addErrorMessage = function (message) {
    if (!f.error_messages) {
      f.error_messages = f.prepareErrorMessage(message);
    }
    else {
      f.error_messages += f.prepareErrorMessage(message);
    }
  } // end addErrorMessage

  f.resetErrorMessages = function () {
    f.error_messages = '';
  } // end resetErrorMessages

  f.showErrorToast = function () {
    var container = $('.nytint-callout-container');

    function getLeft (container) {
      var difference = (container.width() - $('.nytint-error-toast').width());
      return Math.floor(difference / 2);
    }

    $('.nytint-error-toast').detach();
    container.append('<div class="nytint-error-toast">' + f.error_messages + '</div>').fadeIn(1000);
    $('.nytint-error-toast')
      .fadeTo(500, 0.9)
      .css('margin-left', getLeft(container));
      $(window).scrollTop($('.nytint-validation-warning').first().offset().top);
    window.setTimeout(function () {
      $('.nytint-error-toast').fadeOut({
        complete : function () {
          $('.nytint-error-toast').detach();
        }
      });
    }, 5000);
    f.resetErrorMessages();
  } // end showErrorToast

  f.bruiseField = function (elem) {
    elem = $(elem);

    if (elem.prop('type') == 'text'
      || elem.prop('nodeName') == 'TEXTAREA' 
      || elem.prop('nodeName') == 'SELECT'
      || elem.prop('type') == 'fieldset') {
      elem.addClass('nytint-validation-warning');
    }
  } // end bruiseField

  f.unBruiseFields = function () {;
    if ($('.nytint-validation-warning').length > 0) {
      $('.nytint-validation-warning').removeClass('nytint-validation-warning');
    }
  } // end unBruiseFields

  f.areFieldsEmpty = function (fields_array) {
    var fields,
        len = fields_array.length,
        i,
        broken_fields = 0,
        button_group = {};

    if (len) { // do we need this outer condition?

      for (i = 0; i < len; i += 1) {
        fields = fields_array[i];

        fields.each( function (ndx, item) {
          // text inputs
          if (!item.value && $(item).prop('type') == 'text') {
            broken_fields += 1;
            f.bruiseField(item);
          }

          // textareas
          if (!item.value && item.tagName == 'TEXTAREA') {
            broken_fields += 1;
            f.bruiseField(item);
          }

          // selects
          if (!item.value && item.tagName == 'SELECT') {
            broken_fields += 1;
            f.bruiseField(item);
          }
          
          // radio buttons
          if ($(item).prop('type') == 'radio'
          || $(item).prop('type') == 'checkbox') {
            if (item.checked) {
              button_group[$(item).attr('name')] = true;
            }
            else if (!item.checked && button_group[$(item).attr('name')] != true) {
              button_group[$(item).attr('name')] = false;
            }
          }
        });
      } // end loop through fields_array

      for (key in button_group) {
        if (!button_group[key]) {
          broken_fields += 1;
          f.bruiseField($('input[name="' + key + '"]').parents('fieldset'));
        }
      }

      if (broken_fields > 0) {
        f.addErrorMessage('Please fill out the fields marked in red.');
        return true;
      }
    }
    $('.submitphoto').addClass('ready');
    return false;
  } // end areFieldsEmpty

  f.outsideSubmissionLimit = function () {
    if (f.required_non_input_fields) {
      var info_types = [],
          it_len,
          rf = f.required_non_input_fields,
          rf_len = f.required_non_input_fields.length,
          difference_term,
          difference,
          report_div,
          outside_limit = false;

      for (var i = 0; i < rf_len; i += 1) {
        if ($('.' + rf[i] + 'info').length == 0) {
          difference = f[rf[i] + 'min'];
          difference_term = rf[i] + 's';
          report_div = '.nytint-' + rf[i] + '-report';
          outputError('attach', 'minimum', f[rf[i] + 'min']);
          outside_limit = true;
        }
      }

      // capture info type strings
      function pushToInfoDivs (type) {
        var already_pushed = false,
            info_types_len = info_types.length;

        if (info_types.length < 1) {
          info_types.push(type);
        }
        else {
          for (var i = 0; i < info_types_len; i += 1) {
            if (type === info_types[i]) {
              already_pushed = true;
              break;
            }
          }
          if (!already_pushed) {
            info_types.push(type);
          }
        }
        it_len = info_types.length;
      } // end pushToInfoDivs

      function parseInfoDivs () {
        var rx = /(.*)info/;

        $('[class*="info"]').each(function (ndx, el) {
          var type = rx.exec($(el).attr('class'))[1];
          pushToInfoDivs(type);
        });
      } // end parseInfoDivs

      function outputError (verb, extreme, limit) {
        if (difference == 1) {
          difference_term = difference_term.substr(0, (difference_term.length - 1));
        }
        $(report_div).parents('.field').addClass('nytint-validation-warning');
        f.addErrorMessage('Please ' + verb + ' at least ' + difference + ' ' + difference_term + '. There\'s a ' + extreme + ' of ' + limit + '.');
      } // end outputError

      function countInfoDivs (field_type) {
        var min = f[field_type + 'min'],
            max = f[field_type + 'max'],
            submission_len = $('.' + field_type + 'info').length;

        difference_term = field_type + 's';
        report_div = '.nytint-' + field_type + '-report';
        
        if (min >= 1 ) {
          if (submission_len == 0) {
            difference = (min - submission_len);
            outputError('attach', 'minimum', min);
            outside_limit = true;
          }
        }

        if (min && submission_len < min) {
          difference = (min - submission_len);
          outputError('attach', 'minimum', min);
          outside_limit = true;
        }

        if (max && submission_len > max) {
          difference = (submission_len - max);
          outputError('remove', 'maximum', max);
          outside_limit = true;
        }
      }

      parseInfoDivs();

      for (var i = 0; i < it_len; i += 1) {
        countInfoDivs(info_types[i]);
      }

      if (outside_limit) {
        return true;
      }
      return false;
    }
  } // end outsideSubmissionLimit


  f.replaceCaption = function () {
  };

  f.showThanks = function () {
    $('.nytint-submitresponses').hide();
    $('#nytint-callout-form').slideUp();
    $('#nytint-callout-legal').hide();
    $('#nytint-callout-thanks').slideDown(function () {
      $(window).scrollTop($('#nytint-callout-thanks').offset().top);
    });
  } // end showThanks

  f.readyToSubmitForm = function () {
    var ready_to_submit = true,
        // pre-load your own tests here
        tests = [f.areFieldsEmpty, f.outsideSubmissionLimit, f.outsideTextLimit],
        i;

    f.unBruiseFields();

    $('.nytint-validation-error-message').detach();
    if (arguments.length > 0) {
      for (i = 0; i < arguments.length; i+= 0) {
        tests.push(arguments [i]);
      }
    }

    for (i = 0; i < tests.length; i += 1) {
      // each test is for an error, so if one returns true, something\'s wrong
      if (tests[i](f.fields, f.event_obj.target)) {
        ready_to_submit = false;
        // $('.submitphoto').removeClass('ready');
      }
    }
    // $('.submitphoto').addClass('ready');
    return ready_to_submit;
  } // end readyToSubmitForm

  f.sendData = function () {
    f.collectValuesAsJSON('#nytint-callout-form');
    f.collectImagesAsJSON();
    f.collectLocationDescriptionsAsJSON();

    ajaxOpts = {
      type: 'POST',
      url: NYTINT.forms.save_url,
      /* dataType: 'json', # disable for NewsTuffy, enable for Incoming */
      data: f.JSONData,
      success: function (data) {
        f.showThanks();
      },
      error: function (e, status, error_thrown) {
        Airbrake.setProject(98268, '<%= Airbrake.configuration.api_key %>');
        console.log('Form at ' + document.location.href + ' failed to submit with the error: "' + e.status + ' ' + error_thrown + '".');
        Airbrake.push({
          error : e.status + ' ' + error_thrown,
          environment : { navigator_vendor : window.navigator.vendor },
          params : { search : document.location.search }
        });
        f.addErrorMessage('There was a problem processing your submission. Please try again.');
        $('.nytint-callout-container').find('.field').first().addClass('nytint-validation-warning');
        f.showErrorToast();
        $('.nytint-callout-container').find('.field').first().removeClass('nytint-validation-warning');
      }
    }

    // IE 8 and 9 do not support CORS; they use XDomainRequest instead.
    // As suggested by ieinternals, http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
    // we pluck the cookie data using js and pass as part of the request payload.  Attribute has a special case to handle these cookies.
    if(window.XDomainRequest) {
      ajaxOpts.data['_cookies'] = {
        'NYT-S' : $.cookie('NYT-S'),
        'nyt-a' : $.cookie('nyt-a'),
        'RMID' : $.cookie('RMID')
      }
    } else {

      // If the browser supporrts CORS, setting the withCredentials flag sends cookies along with the request.
      // See http://quickleft.com/blog/cookies-with-my-cors
      ajaxOpts.xhrFields =  {
        withCredentials: true
      }
    }

    $.ajax(ajaxOpts);
  } // end sendData

  f.getFieldSelectors = function () {
    return $('[data-required*="true"]');
  } // end getFieldSelectors

  f.toggleIndividualTextareasFromCheckbox = function (evt) {
    var cb = $(evt.currentTarget),
        column_style_rx = /twocolumn|threecolumn/,
        column_style;

    if (cb.prop('checked')) {
      if (column_style_rx.test(cb.parent().attr('class'))) {
        column_style = column_style_rx.exec(cb.parent().attr('class'))[0];
        cb.parent().removeClass(column_style)
          .data('previousstyle', column_style);
      }

      cb.parent().removeClass('hidden-textarea')
        .addClass('popup-textarea')
        .find('label[for$="description"]').show();

      cb.siblings('.hidden-label').removeClass('hidden-label')
        .addClass('popup-label');
    }
    else {
      if (cb.parent().data('previousstyle')) {
        column_style = cb.parent().data('previousstyle');
        cb.parent().addClass(column_style)
          .removeData('previousstyle');
      }

      cb.parent().removeClass('popup-textarea')
        .addClass('hidden-textarea')
        .find('label[for$="description"]').hide();

      cb.siblings('.popup-label').removeClass('popup-label')
        .addClass('hidden-label');
    }
  } // end toggleIndividualTextareasFromCheckbox
    
  f.toggleCommonTextareaFromCheckboxes = function (evt) {
    var cb = $(evt.currentTarget);

    if (cb.prop('checked')) {
      $('#family_and_social .hidden-response')
        .removeClass('hidden-response')
        .addClass('popup-response');
    }
    else if (cb.prop('checked') === false &&
             $('#family_and_social :checked').length === 0) {
      $('#family_and_social .popup-response')
        .removeClass('popup-response')
        .addClass('hidden-response');
    }
  } // end toggleCommonTextareaFromCheckboxes

  f.initMap = function () {
    $('.nytint-location-pick-map').locationpicker({
      radius : 0,
      locationName : "",
      inputBinding : {
        locationNameInput : $('#location-picker-input')
      },
      enableAutocomplete : true,
      enableReverseGeocode : false,
      oninitialized : function () {
      },
      onchanged : function (currentLocation, radius, isMarkerDropped) {
        // first time map is drawn
        if (this.rendered != true) { 
          $('.nytint-location-pick-map').css('visibility', 'visible');
          $('.nytint-location-pick-map').css('position', 'relative');
          $('.nytint-location-pick-map').animate({'margin-top': 0}, function () {
            $(window).scrollTop(($('.nytint-location-pick-map').offset().top - 130));
          });
          $('.nytint-location-pick').after('<p class="nytint-locationconfirmbutton"><span>Marker positioned correctly? Confirm this location.</span></p>');
          this.enableReverseGeocode = true;
          this.rendered = true;
        }
        // map already exists
        else {
          $('.nytint-location-pick-map').animate({'margin-top': 0}, function () {
            $(window).scrollTop(($('.nytint-location-pick-map').offset().top - 130));
          });
          $('.nytint-locationconfirmbutton').show();
        }
        f.currentLocation = currentLocation;
      }
    });
  } // end initMap

  f.hideLocationPicker = function () {
    $('#location-picker-input').hide();
    $('[for="location-picker-input"]').hide();
  }

  f.showLocationPicker = function () {
    $('#location-picker-input').show().val('').focus();
    $('[for="location-picker-input"]').show();
    $('.nytint-addlocationbutton').hide();
  }

  f.confirmLocationLatLon = function (evt) {
    var name = $('#location-picker-input').val(),
        lat = f.currentLocation.latitude,
        lon = f.currentLocation.longitude,
        currentLocation;

    if (!name || name === '') { name = ''; }

    // hide the big map
    $('.nytint-location-pick-map').animate({'margin-top' : -320});
    $('.nytint-locationconfirmbutton').hide();
    f.hideLocationPicker();

    // store to JSONData
    currentLocation = {
      name: name,
      location: { lat: lat, lon: lon }
    };
    f.JSONData = f.JSONData || {};
    f.JSONData.locations = f.JSONData.locations || [];
    f.JSONData.locations.push(currentLocation);

    f.updateThumbs(evt, currentLocation, 'location');

    if ($('.locationinfo').length < f.locationmax) {
      $('.nytint-addlocationbutton').show().on('click', f.showLocationPicker);
    }
  } // end confirmLocationLatLon
  $('.field.location').on('click', '.nytint-locationconfirmbutton', f.confirmLocationLatLon)

  f.updateThumbs = function (evt, input, ftype) {
    var rx = /(.*)info/,
        info_wrapper = $(evt.target).closest('[class*="info"]'),
        field_type,
        info_type,
        operation,
        splice_ndx;

    field_type = (ftype) ? ftype : rx.exec(info_wrapper.attr('class'))[1];
    info_type = '.' + field_type + 'info';
    operation = (input) ? 'add' : 'detach';

    // insert thumbnail map and description prompt
    function addThumb (input) {
      var ndx = $('.' + field_type + 'info').length,
          period = '.';
          
      if (operation == 'add') {
        if (field_type == 'location' ) {
          $('.nytint-' + field_type + '-report').append(
            '<div class="' + field_type + 'info ' + field_type + ndx + '" data-thumbindex="' + ndx + '" data-lat="' + input.location.lat + '" data-lon="' + input.location.lon + '"><div class="thumbwrapper"><img src="http://maps.googleapis.com/maps/api/staticmap?center=' + input.location.lat + ',' + input.location.lon + '&zoom=16&size=100x100&markers=color:red%7Clabel:' + (ndx + 1) + '%7C' + input.location.lat + ',' + input.location.lon + '<%= '&key=AIzaSyDqdXY2-qwfCgnqkppGz7x_L_1GgN1ylFA' if Rails.env.development? %>&sensor=false" /><p class="detachthumbnail">Remove this image</p></div>' + f[field_type + '_metadata'] + '</div>'
          );
        }
      }

      // chute handles this ... for now
      if (field_type == 'image') {
      }

      $(info_type + '.' + field_type + ndx + ' .nytint-' + field_type + '-name').val(input.name);
      
      // create 'You are submitting ...' container
      if ($('.nytint-' + field_type + '-reportheader').length == 0) {
        $('.nytint-' + field_type + '-report').before(
          '<h3 class="nytint-' + field_type + '-reportheader"></h3>'
        );
      }
      $('.nytint-location-reportheader').show();
      $(window).scrollTop(($('.nytint-location-reportheader').offset().top - 140));

      // report the result
      if ((ndx + 1) > 1) { period = 's.'; }

      $('.nytint-' + field_type + '-reportheader').html('You are submitting ' + (ndx + 1) + ' ' + field_type + period);

    } // end addThumb

    function detachThumb (evt) {
      var et = $(evt.target),
          message = 'You are submitting ',
          splice_ndx,
          total_term;

      total_term = field_type + 's';
      splice_ndx = et.closest(info_type).data('thumbindex');

      // clean up the unseen colletion ...
      if (f.JSONData && f.JSONData[field_type + 's']) {
        f.JSONData[field_type + 's'].splice(splice_ndx, 1);
      }

      // remove selected info div from page ...
      et.closest(info_type).detach();

      if ($('.locationinfo').length < f.locationmax) {
        $('.nytint-addlocationbutton').show().on('click', f.showLocationPicker);
      }

      if ($(info_type).length == 0) {
        f.showLocationPicker();
        $('.nytint-location-reportheader').hide();
        $(window).scrollTop(($('.field.location').offset().top - 130));
      }

      if ($(info_type).length == 1) {
        total_term = total_term.substr(0, (total_term.length - 1));
      }

      if ($(info_type).length == f[field_type + 'min']) {
        $(info_type + ' ' + '.detachthumbnail').hide();
      }

      // update the attributes and metadata
      $(info_type).each(function (ndx, info) {
        var el;

        if (ndx >= splice_ndx) {
          el = $(info);
          el.attr('class', (field_type + 'info ' + field_type + ndx));
          el.attr('data-thumbindex', ndx);
          if (field_type == 'location') {
            el.find('img').attr( { 'alt' : message, 'title' : message, 'src' : 'http://maps.googleapis.com/maps/api/staticmap?center=' + el.data('lat') + ',' + el.data('lon') + '&zoom=16&size=100x100&markers=color:red%7Clabel:' + (ndx + 1) + '%7C' + el.data('lat') + ',' + el.data('lon') + '&key=AIzaSyDqdXY2-qwfCgnqkppGz7x_L_1GgN1ylFA&sensor=false' } );
          }
        }
      });

      message += $(info_type).length + ' ' + total_term + '.';
      $(info_type + ' img').attr( { 'alt' : message, 'title' : message } );
      $('.nytint-' + field_type + '-reportheader').html(message);

    } // end detachThumb

    if (operation == 'add') { addThumb(input); }
    if (operation == 'detach' ) { detachThumb(evt); }

  } // end updateThumbs
  $('[class$="report"]').on('click', '.detachthumbnail', f.updateThumbs);
  
  // calls
  $('.country-dropdown select').on('change', function () {
    if ($('.country-dropdown select').val() == 'US' ) {
      $('.input-line.state-local').css('display', 'inline');
      $('.state-dropdown select').attr('data-required', 'true');
    }
    else {
      $('.input-line.state-local').hide();
      $('.state-dropdown select').removeClass('nytint-validation-warning').removeAttr('data-required');
    }
  });

  $('#family_and_social input').on('click', f.toggleCommonTextareaFromCheckboxes);
  
  $('.nytint-submitresponses').on('click', function (evt) {
    evt.preventDefault();
    f.event_obj = evt;
    f.collectFields($('#nytint-callout-form'), f.getFieldSelectors());
    if (f.readyToSubmitForm()) {
      f.sendData();
    }
    else {
      f.showErrorToast();
    }
  });

  $('#nytint-callout-form').delegate('[data-wordcount]', 'keydown change', f.countText);
  $('#nytint-callout-form').delegate('[data-charactercount]', 'keydown change', f.countText);

  // this adds support for placeholder text in IE8/9
  // http://www.hagenburger.net/BLOG/HTML5-Input-Placeholder-Fix-With-jQuery.html
  f.bindPlaceholderFix = function () {
    $('[placeholder]').focus(function() {
      var input = $(this);
      if (input.val() == input.attr('placeholder')) {
        input.val('');
        input.removeClass('placeholder');
      }
    }).blur(function() {
      var input = $(this);
      if (input.val() == '' || input.val() == input.attr('placeholder')) {
        input.addClass('placeholder');
        input.val(input.attr('placeholder'));
      }
    }).blur();
  }

});
