//https://learn.jquery.com/plugins/basic-plugin-creation/

(function ($) {
  $.fn.ssAC = function (options) {

    //extend jQuery contains to be case-insensitive
    $.expr[':'].containsIC = function (n, i, m) {
      return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    //ensure that if in a jQuery UI it will "overflow"
    $(".ui-dialog-content").css("overflow", "visible");

    //init global variables
    var _self = this;
    _self.selectedLI = null;
    _self.ssSL = $(this);
    _self.ssSL.hide(); //hide select list
    // This is the easiest way to have default options.
    var settings = $.extend({
      startsWith: false,
      width: _self.ssSL.outerWidth(true)
    }, options);

    ////////////////////////////////
    // CONSTRUCT NEW DOM ELEMENTS //
    ////////////////////////////////

    //configure text box
    this.ssTB = $.parseHTML("<input type='text' />");
    $(_self.ssTB).attr("class", _self.ssSL.attr("class"));
    $(_self.ssTB).attr("style", _self.ssSL.attr("style"));
    $(_self.ssTB).css("width", settings.width + 'px'); //force correct width if not stipulated
    $(_self.ssSL).after(_self.ssTB);

    //convert OPTIONS to UL > LI
    var li = "";
    _self.ssSL.find('option').each(function (i, v) {
      var value = $(v);
      li += "<li value='" + value.val() + "'>" + value.text() + "</li>";
    })

    this.ssDIV = $.parseHTML('<div class="ssAutoComplete" style="width:' + settings.width + 'px" />');
    this.ssDivALL = $.parseHTML('<div class="ssALL"/>');
    this.ssDivUL = $.parseHTML('<div class="ssDivUL"/>');
    this.ssUL = $.parseHTML('<ul class="ssUL"/>');
    this.ssClear = $.parseHTML('<div class="ssAC-clear">clear ...</div>');
    //put it all together
    $(_self.ssUL).append(li); //add LI to UL
    $(_self.ssDivUL).append(_self.ssUL); //UL to DivUL
    if ($(_self.ssUL).find('li:empty').length > 0) {
      $(_self.ssDivALL).append(_self.ssClear); //add clear to all
    }
    $(_self.ssDivALL).append(_self.ssDivUL); //add UL to all
    $(_self.ssDIV).append(_self.ssDivALL); //add ALL to overall DIV
    $(_self.ssTB).show().after(_self.ssDIV);//add to DOM

    this.ScrollOffset = 0;
    if ($(_self.ssUL).find('li:empty').length > 0) {
      _self.UpOffset = 8; //padding
      _self.DownOffset = 0; //no padding
    }
    else {
      _self.UpOffset = -$(_self.ssUL).find('li').height(); //no padding
      _self.DownOffset = $(_self.ssUL).find('li').height() + 8; //padding
    }
    $(this.ssDIV).hide();
    //console.log(_self.ScrollOffset);


    ////////////
    // EVENTS //
    ////////////

    //Clear selection
    $(_self.ssDIV).on('mousedown', '.ssAC-clear', function (e) {
      _self.selectedLI = $(_self.ssDIV).find("li:empty");
      SelectIndex(0);
      $(_self.ssDIV).hide();
      $(_self.ssDIV).find('li').not(':empty').show();
    });

    //textbox click - open list
    $(_self.ssTB).on('click', function () {
      $(_self.ssDIV).show().position({ my: "left top+5", at: "left bottom", of: _self.ssTB })
      ScrollIntoView(_self);
    })

    //textbox - ignore left and right arrows due to unwanted caret movement in textbox
    $(_self.ssTB).on('keydown', function (e) {
      if (e.keyCode === 38) { MOVE(-1); e.preventDefault(); }
      else if (e.keyCode === 40) { MOVE(1); e.preventDefault(); }
    })

    //textbox - handle keys
    $(_self.ssTB).on('keyup', function (e) {

      //UP & DOWN if list NOT showing
      if ((e.keyCode === 38 || e.keyCode === 40) && !$(_self.ssDIV).is(":visible")) {
        $(_self.ssDIV).show().position({ my: "left top+5", at: "left bottom", of: _self.ssTB });
      }
      else if (e.keyCode === 38 || e.keyCode === 40) {
        e.preventDefault();
      }
      else if (e.keyCode === 13 || e.keyCode === 27) { //ENTER & TAB
        SelectIndex(0);
        $(_self.ssDIV).hide();
      }
      else if (e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18) {
        //ignore: tab, leftarrow, rightarrow, shift, ctrl, alt
      }
      else {
        if (e.keyCode === 46) {
          if ($(_self.ssDIV).find("li:empty").length > 0) {
            _self.selectedLI = $(_self.ssDIV).find("li:empty");
            SelectIndex(0);
          }
          $(_self.ssDIV).find('li').not(':empty').show();
          e.preventDefault();
          return;
        }
        $(_self.ssDIV).show().position({ my: "left top+5", at: "left bottom", of: _self.ssTB })
        ScrollIntoView(_self);
        var searchString = $(_self.ssTB).val().toLowerCase();
        var searchLength = searchString.length;
        var fList;
        //filter (anywhere or start)
        if (settings.startsWith) {
          fList = $(_self.ssDIV).find("li").not(':empty').filter(function () {
            return $(this).text().slice(0, searchLength).toLowerCase() === searchString;
          });
        }
        else {
          fList = $(_self.ssDIV).find('li:containsIC("' + searchString + '")').not(':empty');
        }
        $(_self.ssDIV).find('li').hide();
        fList.show();
        _self.selectedLI = fList.first();
        SelectIndex(1);
      }
      e.preventDefault();
    })

    //textbox - blur event (hide div list)
    $(_self.ssTB).on('blur', function (e) {
      $(_self.ssDIV).hide();
      SelectIndex(0);
      //$(_self.ssDIV).find('li').show();
    })

    //click list item in DIV (delegate)
    $(_self.ssDIV).on('mousedown', 'li', function (e) {
      _self.selectedLI = $(this);
      SelectIndex(0);
      $(_self.ssDIV).hide();
    });

    ///////////////
    // FUNCTIONS //
    ///////////////

    //MOVE
    function MOVE(n) {
      if ($(_self.ssDIV).find('li:visible').length <= 1) { return; }

      if (liIndex() === -1) {
        if (n > 0) { _self.selectedLI = $(_self.ssDIV).find('li:visible').first(); }
        else { _self.selectedLI = $(_self.ssDIV).find('li:visible').last(); }
        SelectIndex(1);
        return;
      }
      else if (n > 0) {
        _self.selectedLI = $(_self.selectedLI).nextAll('li:visible').first();
        if (liIndex() === -1) { _self.selectedLI = $(_self.ssDIV).find('li:visible').first(); }
      }
      else if (n < 0) {
        _self.selectedLI = $(_self.selectedLI).prevAll('li:visible').first();
        if (liIndex() === -1) { _self.selectedLI = $(_self.ssDIV).find('li:visible').last(); }
      }
      SelectIndex(1);
      ScrollIntoView();
    }

    //SELECT INDEX
    function SelectIndex(i) {
      $(_self.ssDIV).find('li').removeClass('ssSI');
      $(_self.selectedLI).addClass('ssSI');
      $(_self.ssSL).val(liValue());
      if (i !== 1) $(_self.ssTB).val(liText());
    }

    //scroll in to view
    function ScrollIntoView() {
      if ($(_self.selectedLI).position() === undefined) return;
      var divHeight = $(_self.ssDivUL).height()
      var sliTop = $(_self.selectedLI).position().top;
      var rowHeight = $(_self.selectedLI).height();//add padding
      //debug
      //var items = {
      //  'ssUL.top': $(_self.ssUL).position().top,
      //  'ssDivUL.scrolltop': $(_self.ssDivUL).scrollTop(),
      //  'ssDivUL.height': $(_self.ssDivUL).height(),
      //  'selectedLI.top': $(_self.selectedLI).position().top,
      //  'DownOffset': _self.DownOffset,
      //  'UpOffset': _self.UpOffset
      //};
      //console.log(items);

      //flip to top and then calc where to go, this IS quick as there is no redraw
      if (sliTop + _self.DownOffset > divHeight) {
        $(_self.ssDivUL).scrollTop(0).scrollTop($(_self.selectedLI).position().top - divHeight + _self.DownOffset);
      }
      else if (sliTop < rowHeight) {
        $(_self.ssDivUL).scrollTop(0).scrollTop($(_self.selectedLI).position().top - rowHeight - _self.UpOffset);
      }
    }

    //get selected text
    function liText() {
      if (_self.selectedLI === null) { return ""; }
      else { return $(_self.selectedLI[0]).text(); }
    }
    //get selected value
    function liValue() {
      if (_self.selectedLI === null) { return ""; }
      else { return $(_self.selectedLI[0]).attr("value"); }
    }
    //get selected index
    function liIndex() {
      if (_self.selectedLI === null) { return -1; }
      else { return $(_self.ssDIV).find(_self.selectedLI[0]).index('li'); }
    }

    //set selected item
    if ($(_self.ssSL).find('[selected]').length) {
      var value = $(_self.ssSL).find('[selected]').val();
      _self.selectedLI = $(_self.ssDIV).find("li[value='" + value + "']");
      SelectIndex(_self, 0);
    }

    return this;
  };

}(jQuery));
