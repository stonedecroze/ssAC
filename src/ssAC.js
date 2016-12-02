//https://learn.jquery.com/plugins/basic-plugin-creation/

(function ($) {
  $.fn.ssAC = function (options) {

    //extend jQuery contains to be case-insensitive
    $.expr[':'].containsIC = function (n, i, m) {
      return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    //init global variables
    var _self = this;
    _self.selectedLI = null;
    _self.ssSL = $(this);
    // This is the easiest way to have default options.
    var settings = $.extend({
      startsWith: false,
      width: _self.ssSL.outerWidth(true)
    }, options);

    ////////////////////////////////
    // CONSTRUCT NEW DOM ELEMENTS //
    ////////////////////////////////

    //configure text box
    this.ssTB = $.parseHTML("<input type='text' />")
    $(_self.ssTB).attr("class", _self.ssSL.attr("class"));
    $(_self.ssTB).attr("style", _self.ssSL.attr("style"));
    $(_self.ssTB).css("width", settings.width); //force correct width if not stipulated
    _self.ssSL.after(_self.ssTB);
    _self.ssSL.hide(); //hide select list

    //convert OPTION to LI
    var li = "";
    _self.ssSL.find('option').each(function (i, v) {
      var value = $(v);
      li += "<li value='" + value.val() + "'>" + value.text() + "</li>";
    })
    var ul = "<ul>" + li + "</ul>";
    //create DIV list
    _self.ssDIV = $.parseHTML("<div class='SSAC' style='width:" + settings.width + "px'>" + ul + "</div>");
    _self.ssSL.after(_self.ssDIV);
    $(_self.ssDIV).hide();

    ////////////
    // EVENTS //
    ////////////

    //textbox click - open list
    $(_self.ssTB).on('click', function () {
      $(_self.ssDIV).show().position({ my: "left top+5", at: "left bottom", of: _self.ssTB })
      ScrollIntoView(_self);
    })

    //textbox - ignore left and right arrows due to unwanted caret movement in textbox
    $(_self.ssTB).on('keydown', function (e) {
      if (e.keyCode === 38 || e.keyCode === 40) {
        e.preventDefault();
      }
    })

    //textbox - handle keys
    $(_self.ssTB).on('keyup', function (e) {
      //UP & DOWN if list NOT showing
      if ((e.keyCode === 38 || e.keyCode === 40) && !$(_self.ssDIV).is(":visible")) {
        $(_self.ssDIV).show().position({ my: "left top+5", at: "left bottom", of: _self.ssTB });
        if (_self.selectedLI === null) { _self.selectedLI = $(_self.ssDIV).find('li:visible').first(); }
        ScrollIntoView(_self);
      }
      else if (e.keyCode === 38) { //arrow up
        MOVE(_self, -1);
      }
      else if (e.keyCode === 40) { //arrow down
        MOVE(_self, 1);
      }
      else if (e.keyCode === 13 || e.keyCode === 27) { //ENTER & TAB
        SelectIndex(_self, 0);
        $(_self.ssDIV).hide();
      }
      else if (e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18) {
        //ignore: tab, leftarrow, rightarrow, shift, ctrl, alt
      }
      else {
        if (e.keyCode !== 46) {
          $(_self.ssDIV).show().position({ my: "left top+5", at: "left bottom", of: _self.ssTB })
          ScrollIntoView(_self);
        }
        var searchString = $(_self.ssTB).val().toLowerCase();
        var searchLength = searchString.length;
        var fList;
        //filter (anywhere or start)
        if (settings.startsWith) {
          fList = $(_self.ssDIV).find("li").filter(function () {
            return $(this).text().slice(0, searchLength).toLowerCase() === searchString;
          });
        }
        else {
          fList = $(_self.ssDIV).find('li:containsIC("' + searchString + '")');
        }

        $(_self.ssDIV).find('li').hide();
        fList.show();
        _self.selectedLI = fList.first();
        SelectIndex(_self, 1);
      }
      e.preventDefault();
    })

    //textbox - blur event (hide div list)
    $(_self.ssTB).on('blur', function (e) {
      $(_self.ssDIV).hide();
      SelectIndex(_self, 0);
      $(_self.ssDIV).find('li').show();
    })

    //click list item in DIV (delegate)
    $(_self.ssDIV).on('mousedown', 'li', function (e) {
      _self.selectedLI = $(this);
      SelectIndex(_self, 0);
      $(_self.ssDIV).hide();
    });

    ///////////////
    // FUNCTIONS //
    ///////////////
    //MOVE
    function MOVE(_self, n) {
      if ($(_self.ssDIV).find('li:visible').length <= 1) { return; }

      if (liIndex(_self) === -1) {
        if (n > 0) { _self.selectedLI = $(_self.ssDIV).find('li:visible').first(); }
        else { _self.selectedLI = $(_self.ssDIV).find('li:visible').last(); }
        SelectIndex(1);
        return;
      }
      else if (n > 0) {
        _self.selectedLI = $(_self.selectedLI).nextAll(':visible').first();
        if (liIndex(_self) === -1) { _self.selectedLI = $(_self.ssDIV).find('li:visible').first(); }
      }
      else if (n < 0) {
        _self.selectedLI = $(_self.selectedLI).prevAll(':visible').first();
        if (liIndex(_self) === -1) { _self.selectedLI = $(_self.ssDIV).find('li:visible').last(); }
      }
      SelectIndex(_self, 1);
    }

    //SELECT INDEX
    function SelectIndex(_self, i) {
      $(_self.ssDIV).find('li').removeClass('ssSI');
      $(_self.selectedLI).addClass('ssSI');
      $(_self.ssSL).val(liValue(_self));
      if (i !== 1) $(_self.ssTB).val(liText(_self));
      ScrollIntoView(_self);
    }

    //scroll in to view
    function ScrollIntoView(_self) {
      $(_self.ssDIV).find('li:empty').hide();
      var div = $(_self.ssDIV);
      var sli = $(_self.selectedLI);
      if (sli.position() === undefined) return;
      var NewTop = sli.position()["top"] + sli.height()*2 - div.height() + div.scrollTop();
      div.scrollTop(NewTop);
    }

    //get selected text
    function liText(_self) {
      if (_self.selectedLI === null) { return ""; }
      else { return $(_self.selectedLI[0]).text(); }
    }
    //get selected value
    function liValue(_self) {
      if (_self.selectedLI === null) { return ""; }
      else { return $(_self.selectedLI[0]).attr("value"); }
    }
    //get selected index
    function liIndex(_self) {
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
