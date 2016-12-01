//https://learn.jquery.com/plugins/basic-plugin-creation/

(function ($) {
  $.fn.ssAC = function (options) {

    //extend jQuery contains to be case-insensitive
    $.expr[':'].containsIC = function (n, i, m) {
      return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    //init global variables
    var _self = this;
    this.selectedLI = null;
    this.ssSL = $(this);
    // This is the easiest way to have default options.
    var settings = $.extend({
      startsWith: false,
      width: _self.ssSL.outerWidth(true)
    }, options);

    ////////////////////////////////
    // CONSTRUCT NEW DOM ELEMENTS //
    ////////////////////////////////

    //configure text box
    this.ssTB = $.parseHTML("<input type='text' style='" + _self.ssSL.attr("style") + "' class='" + _self.ssSL.attr("class") + "' />")
    $(this.ssTB).css("width", settings.width); //force correct width if not stipulated
    _self.ssSL.after(_self.ssTB);
    _self.ssSL.hide(); //hide select list

    //convert OPTION to LI
    var li = "";
    _self.ssSL.find('option').each(function (i, v) {
      var value = $(v);
      li = li + "<li value='" + value.val() + "'>" + value.text() + "</li>";
    })
    //create DIV list
    this.ssDIV = $.parseHTML("<div class='SSAC' style='width:" + settings.width + "px'><ul>" + li + "</ul></div>");
    _self.ssSL.after(_self.ssDIV);
    $(_self.ssDIV).hide();

    ////////////
    // EVENTS //
    ////////////

    //textbox click - open list
    $(_self.ssTB).on('click', function () {
      $(_self.ssDIV).show().position({ my: "left top+5", at: "left bottom", of: _self.ssTB })
      _self.SITV();
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
        _self.SITV();
      }
      else if (e.keyCode === 38) { //arrow up
        _self.MOVE(-1);
      }
      else if (e.keyCode === 40) { //arrow down
        _self.MOVE(1);
      }
      else if (e.keyCode === 13 || e.keyCode === 27) { //ENTER & TAB
        _self.SelectIndex(0);
        $(_self.ssDIV).hide();
      }
      else if (e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18) {
        //ignore: tab, leftarrow, rightarrow, shift, ctrl, alt
      }
      else {
        if (e.keyCode !== 46) {
          $(_self.ssDIV).show().position({ my: "left top+5", at: "left bottom", of: _self.ssTB })
          _self.SITV();
        }
        var searchString = $(_self.ssTB).val().toLowerCase();
        var searchLength = searchString.length;
        var fList;
        //filter (anywhere or start)
        if (settings.startsWith) {
          fList = $(_self.ssDIV).find("li").filter(function () {
            return $(this).text().slice(0, searchLength).toLowerCase() == searchString;
          });
        }
        else {
          fList = $(_self.ssDIV).find('li:containsIC("' + searchString + '")');
        }

        $(_self.ssDIV).find('li').hide();
        fList.show();
        _self.selectedLI = fList.first();
        _self.SelectIndex(1);
      }
      e.preventDefault();
    })

    //textbox - blur event (hide div list)
    $(_self.ssTB).on('blur', function (e) {
      $(_self.ssDIV).hide();
      _self.SelectIndex(0);
      $(_self.ssDIV).find('li[value]').show();
    })

    //click list item in DIV (delegate)
    $(_self.ssDIV).on('mousedown', 'li', function (e) {
      _self.selectedLI = $(this);
      _self.SelectIndex(0);
      $(_self.ssDIV).hide();
    });

    ///////////////
    // FUNCTIONS //
    ///////////////
    //MOVE
    this.MOVE = function (n) {
      if ($(_self.ssDIV).find('li:visible').length <= 1) { return; }

      if (_self.liIndex() === -1) {
        if (n > 0) { _self.selectedLI = $(_self.ssDIV).find('li:visible').first(); }
        else { _self.selectedLI = $(_self.ssDIV).find('li:visible').last(); }
        _self.SelectIndex(1);
        return;
      }
      else if (n > 0) {
        _self.selectedLI = $(_self.selectedLI).nextAll(':visible').first();
        if (_self.liIndex() === -1) { _self.selectedLI = $(_self.ssDIV).find('li:visible').first(); }
      }
      else if (n < 0) {
        _self.selectedLI = $(_self.selectedLI).prevAll(':visible').first();
        if (_self.liIndex() === -1) { _self.selectedLI = $(_self.ssDIV).find('li:visible').last(); }
      }
      _self.SelectIndex(1);
    }

    //SELECT INDEX
    this.SelectIndex = function (i) {
      $(_self.ssDIV).find('li').removeClass('ssSI');
      $(_self.selectedLI).addClass('ssSI');
      $(_self.ssSL).val(_self.liValue());
      if (i !== 1) $(_self.ssTB).val(_self.liText());
      _self.SITV();
    }

    //scroll in to view
    this.SITV = function () {
      $(_self.ssDIV).find('li:empty').hide();
      var div = $(_self.ssDIV);
      var sli = $(_self.selectedLI);
      if (sli.position() === undefined) return;

      if (sli.position()["top"] + sli.height() > div.height() + div.scrollTop()) {
        div.animate({ scrollTop: sli.position()["top"] - div.height() + sli.height() * 2 }, 100)
      } else if (sli.position()["top"] < div.scrollTop()) {
        div.animate({ scrollTop: sli.position()["top"] }, 100)
      }
    }

    //get selected text
    this.liText = function () {
      if (_self.selectedLI === null) { return ""; }
      else { return $(_self.selectedLI[0]).text(); }
    }
    //get selected value
    this.liValue = function () {
      if (_self.selectedLI === null) { return ""; }
      else { return $(_self.selectedLI[0]).attr("value"); }
    }
    //get selected index
    this.liIndex = function () {
      if (_self.selectedLI === null) { return -1; }
      else { return $(_self.ssDIV).find(_self.selectedLI[0]).index('li'); }
    }

    //set selected item
    if ($(_self.ssSL).find('[selected]').length) {
      var value = $(_self.ssSL).find('[selected]').val();
      _self.selectedLI = $(_self.ssDIV).find("li[value='" + value + "']");
      _self.SelectIndex(0);
    }

    return this;
  };

}(jQuery));
