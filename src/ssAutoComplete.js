//extend jQuery contains to be case-insensitive
$.expr[':'].containsCI = function (n, i, m) {
  return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

//ensure that if in a jQuery UI dialogue it will "overflow"
$(".ui-dialog-content").css("overflow", "visible");


(function ($) {
  $.fn.SSAC2 = function (options) {

    // set or overwrite default options.
    var settings = $.extend({
      fred: "pig",
      kate: "oink",
      variable2: "hello"
    }, options);

    //start proper here for EACH control sent in
    return this.each(function () {
      //RETURN if object is NOT a select
      if ($(this).is("select") === false) { return; }
      $(this).hide();
      var _self = $(this);
      _self.textbox = $("<input type='text' />");
      _self.container = $("<div class='ssac2Container'></div>");
      _self.divouter = $("<div class='ssac2outer'></div>"); //required for positioning "clear"
      _self.divlist = $("<div class='ssac2inner'></div>");
      _self.filteredlist = _self.divlist.find("span");
      //_self.selectedvalue = "";
      _self.divclear = $("<span class='ssacclear' data-clear='true'>clear</span>");
      _self.canclear = false;

      //convert options to list items + selected
      $(this).find("option").each(function (i, v) {
        var spanclass="";
        if (v.selected === true) {
          spanclass = "ssacselected";
          _self.textbox.val(v.text);
          //_self.selectedvalue = v.value;
        }
        else { spanclass = ""; }
        var span = "<span class='" + spanclass + "' data-ssvalue='" + v.value + "'>" + v.text + "</span>";
        _self.divlist.append(span);
      });

      //add clear if there is a value="" option
      if ($(this).find("option[value='']").length === 1) {
        _self.divouter.append(_self.divclear);
        _self.divlist.find("[data-ssvalue='']").remove();
        _self.canclear = true;
      }

      //clear
      _self.divclear.on('mousedown', function () {
        console.log("clear mousedown");
        _self.divlist.find("span").show();
        _self.filteredlist = _self.divlist.find("span");
        SetValue('');
      })

      //select item
      _self.divlist.on('mousedown', 'span', function () {
        console.log('divlist mousedown ' + $(this).data('ssvalue'));
        SetValue($(this).data('ssvalue'));
      })

      //open list on select input
      _self.textbox.on('focus', function () {
        console.log("textbox focus");
        var val = _self.val();
        _self.divlist.find('span').removeClass('ssachover');
        _self.divlist.find("[data-ssvalue='" + val + "']").addClass('ssachover');
        _self.divouter.show();
      })

      //close
      _self.textbox.on('blur', function () {
        console.log('text blur ' + _self.filteredlist.length);
        _self.divouter.hide();
        if (_self.filteredlist.length === 1) {
            SetValue(_self.filteredlist.data('ssvalue'));
        }
        else {
          SetValue(_self.find("option:selected").val());
        }
      })
      //set select value
      function SetValue(val) {
        var txt = _self.find("option[value='" + val + "']").text();
        if (_self.val() === val) {
          console.log("setvalue - value not changed '" + val + "'");
          _self.filteredlist = _self.divlist.find("span").show();//remove filter
          _self.textbox.val(txt);
          return;
        }//exit if nothing changed, refresh text, AVOID triggering change

        console.log("setvalue '" + val + "'");
        if (val === "") { txt = "";}
        _self.divlist.find('.ssacselected').removeClass('ssacselected');
        _self.divlist.find("[data-ssvalue='"+val+"']").addClass('ssacselected');
        _self.textbox.val(txt);
        _self.val(val).trigger('change');
        _self.divouter.hide();
      }

      //typing in textbox
      _self.textbox.on('keyup', function (event) {
        var key = event.which;
        console.log("keyup " + key);
        //backspace = 8, del = 46, tab = 38, esc = 27, enter = 13
        //home = 36, end = 35, left = 37, right = 39, up = 38, down = 40
        if (key === 27) {
          _self.divouter.hide();
          return;
        }

        if (key === 38) {
          var current = _self.divlist.find('.ssachover');
          var prev = _self.divlist.find('.ssachover').prev();
          prev.addClass('ssachover');
          current.removeClass('ssachover');
          return;
        }
        if (key === 40) {
          var current = _self.divlist.find('.ssachover');
          var next = _self.divlist.find('.ssachover').next();
          next.addClass('ssachover');
          current.removeClass('ssachover');
          return;
        }
        if (key === 13) {
          var val = _self.divlist.find('.ssachover').data('ssvalue');
          SetValue(val);
          return;
        }

        //filter list
        var inputtext = _self.textbox.val();
        if (inputtext.length === 0) {
          _self.divlist.find("span").show();
          _self.filteredlist = _self.divlist.find("span");
          if (_self.canclear) { _self.val('');} //only clear if clearable
        }
        if (inputtext.length > 0) {
          _self.filteredlist = _self.divlist.find("span:containsCI('" + inputtext + "')");
          _self.divlist.find("span").hide();
          _self.filteredlist.show();
        }
      })

      //glue it all together and put in DOM
      _self.divouter.append(_self.divlist);
      _self.container.append(_self.textbox);
      _self.container.append(_self.divouter);
      _self.container.insertAfter(this);
      
    });//end EACH
  };//end function
}(jQuery));