jQuery.expr[':'].Contains = function (a, i, m) {
  return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

(function ($) {


  $.fn.ssac = function (options) {

    return this.each(function () {
      if (this.tagName !== 'SELECT') { return; }
      var selectlist = $(this);
      var selectedvalue = selectlist.val();
      var selectedtext = selectlist.find('option:selected').text();
      var itemcount = selectlist.find('option').length;

      var settings = $.extend({
        startsWith: false,
        defaultValue: null,
        width: selectlist.outerWidth(true),
        onChange:null
      }, options);

      var divlist = '';
      var divclear = '';
      var hasclearstyle = '';
      selectlist.find('option').each(function (index, option) {
        var value = option.getAttribute('value');
        var text = option.innerText;
        var style = '';
        if (value === selectedvalue) {
          style = style + ' ssac-selected';
        }
        if (value === '') {
          divclear = '<div class="ssac-clear' + style + '" data-value="">clear ...</div>';
          hasclearstyle = ' ssac-list-hasclear';
        }
        else {
          divlist = divlist + '<div class="ssac-item' + style + '" data-value="' + value + '">' + text + '</div>';
        }
      });
      var divdropdown = $('<div class="ssac-outer" style="width:' + settings.width + 'px">' +
        '<input class="ssac-input form-control" type="text" value="' + selectedtext + '" />' +
        '<div class="ssac-listparent">' +
        divclear +
        '<div class="ssac-list' + hasclearstyle + '">' +
        divlist +
        '</div>' +
        '</div>' +
        '</div>');
      $(divdropdown).find('.ssac-listparent').hide();
      selectlist.after(divdropdown);
      selectlist.hide();


      //SSAC events
      divdropdown.on('mousedown', '.ssac-item', function (i) {
        selectlist.val($(this).data('value')).trigger('change');
        $(divdropdown).find('.ssac-input').focus();
      });

      divdropdown.on('mousedown', '.ssac-clear', function (i) {
        selectlist.val('').trigger('change');
        $(divdropdown).find('.ssac-item').show();
        i.preventDefault();
      });

      //focus event
      divdropdown.on('focusin', 'input', function (i) {
        i.preventDefault();
        $(divdropdown).find('.ssac-listparent').show();
        scrollIntoViewIfNeeded();
      });
      //focus event
      divdropdown.on('focusout', function (i) {
        $(divdropdown).find('.ssac-listparent').hide();
        selectedtext = selectlist.find('option:selected').text();
        $(divdropdown).find('input').val(selectedtext);
        $(divdropdown).find('.ssac-item').show();
        settings.onChange();
      });

     //KEY DOWN EVENTS, only cursor up and down
      divdropdown.on('keydown', 'input', function (i) {

        if (i.keyCode === 13) { //ENTER
          i.preventDefault();
          return;
        }

        if (i.keyCode === 40) {//Down Arrow
          var curval = $(divdropdown).find('.ssac-selected:visible');
          var newval = $(divdropdown).find('.ssac-selected').nextAll('div:visible').data('value');
          if (curval.length === 0 || curval.data('value') === '') {
            newval = $(divdropdown).find('.ssac-item:visible').first().data('value');
            selectlist.val(newval).trigger('change');
            scrollIntoViewIfNeeded();
            return;
          }
          if (newval === null || newval === undefined) { return; }
          selectlist.val(newval).trigger('change');
          scrollIntoViewIfNeeded();
          return;
        }

        if (i.keyCode === 38) { //UP arrow
          var newvalup = $(divdropdown).find('.ssac-selected').prevAll('div:visible').data('value');
          if (newvalup === null || newvalup === undefined) {
            if (divclear !== '') {
              selectlist.val('').trigger('change');
              scrollIntoViewIfNeeded();
            }
            return;
          }
          selectlist.val(newvalup).trigger('change');
          scrollIntoViewIfNeeded();
          return;
        }
      });

      //KEY UP EVENTS
      divdropdown.on('keyup', 'input', function (i) {
        //console.log(i.key, i.keyCode);

        //keys we want to ignore
        if ([9, 16, 17, 18, 19, 20, 35, 36, 37, 38, 39, 40, 45, 91, 92, 93, 144, 145].indexOf(i.keyCode) > -1) {
          i.preventDefault();
          return;
        }

        if (i.keyCode === 27) {//escape
          $(divdropdown).find('.ssac-listparent').hide();
          return;
        }

        if (i.keyCode === 13) { //ENTER
          var newvalent = $(divdropdown).find('.ssac-selected').data('value');
          $(divdropdown).find('.ssac-item').show();
          selectlist.val(newvalent).trigger('change');
          scrollIntoViewIfNeeded();
          i.preventDefault();
          return;
        }

        var term = $(divdropdown).find('input').val().toUpperCase();
        $(divdropdown).find('.ssac-item').hide();

        if (settings.startsWith) {
          var termlength = term.length;
          $(divdropdown).find('.ssac-item').filter(function (a, b) {
            return $(b).text().slice(0, termlength).toUpperCase() === term;
          }).show();
        }
        else {
          $(divdropdown).find('div:Contains("' + term + '")').show();
        }
      });

      //change event
      selectlist.on('change', function (d, e) {
        selectedvalue = selectlist.val();
        selectedtext = selectlist.find('option:selected').text();
        $(divdropdown).find('input').val(selectedtext);
        $(divdropdown).find('.ssac-selected').removeClass('ssac-selected');
        $(divdropdown).find('[data-value="' + selectedvalue + '"]').addClass('ssac-selected');
      });

      if (settings.defaultValue !== null) {
        selectlist.val(settings.defaultValue).trigger('change');
      }

      //HELPER functions
      function scrollIntoViewIfNeeded() {
        if (selectlist.val() === '') { return;};
        var elem = $(divdropdown).find('.ssac-selected')[0];
        var container = $(divdropdown).find('.ssac-list')[0];
        var rectElem = elem.getBoundingClientRect();
        var rectContainer = container.getBoundingClientRect();
        if (rectElem.bottom > rectContainer.bottom) elem.scrollIntoView(false);
        if (rectElem.top < rectContainer.top) elem.scrollIntoView();
      }

      //end
    });

  };
}(jQuery));
