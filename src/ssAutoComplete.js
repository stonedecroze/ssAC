//extend jQuery contains to be case-insensitive
$.expr[':'].containsIC = function (n, i, m) {
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
      _self.divclear = $("<span class='ssacclear' data-clear='true'>clear</span>")

      //convert options to list items + selected
      $(this).find("option").each(function (i, v) {
        var spanclass="";
        if (v.selected === true) {
          spanclass = "ssacselected";
          _self.textbox.val(v.text);
        }
        else { spanclass = ""; }
        var span = "<span class='" + spanclass + "' data-ssvalue='" + v.value + "'>" + v.text + "</span>";
        _self.divlist.append(span);
      });

      //add clear if there is a value="" option
      if ($(this).find("option[value='']").length === 1) {
        _self.divouter.append(_self.divclear);
        _self.divlist.find("[data-ssvalue='']").remove();
      }

      //clear
      _self.divclear.on('click', function () {
        SetValue('', '');
      })

      _self.divlist.on('click', 'span', function () {
        SetValue($(this).data('ssvalue'), $(this).text());
      })

      //open list on select input
      _self.textbox.on('focus', function () {
        _self.divouter.show();
      })

      function SetValue(val, txt) {
        _self.textbox.val(txt);
        _self.val(val).trigger('change');
        _self.divouter.hide();
      }

      //glue it all together and put in DOM
      _self.divouter.append(_self.divlist);
      _self.container.append(_self.textbox);
      _self.container.append(_self.divouter);
      _self.container.insertAfter(this);
      
    });//end EACH
  };//end function
}(jQuery));