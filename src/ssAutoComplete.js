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

      _self.textbox.val(this.length);
      _self.textbox.insertAfter(this);
      //$(this).append(_self.textbox);
      

    });
  };
}(jQuery));