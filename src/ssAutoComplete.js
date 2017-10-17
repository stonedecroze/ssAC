(function ($) {

  $.fn.SSAC2 = function (options) {

    //extend jQuery contains to be case-insensitive
    $.expr[':'].containsIC = function (n, i, m) {
      return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
    };

    //ensure that if in a jQuery UI dialogue it will "overflow"
    $(".ui-dialog-content").css("overflow", "visible");

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

      var _self = this;
      _self.textbox = $("<input type='text' value='nuts' />");
      _self.container = $("<div></div>");
      _self.UL = $("<ul></ul>");

      //convert options to list items
      $(this).find("option").each(function (i, v) {
        var value = $(v);
        var li = "<li value='" + value.val() + "'>" + value.text() + "</li>";
        _self.UL.append(li);
      });

      _self.container.append(_self.textbox);
      _self.container.append(_self.UL);

      _self.textbox.val(this.length);
      _self.container.insertAfter(this);
      
      
    });//end EACH
  };//end function
}(jQuery));