/**
 * FitWindow jQuery plugin
 * 
 * Makes an element resize to fit the width and height of the browser window.
 * 
 * Options:
 * 
 *     heightOffset: number of pixels subtracted from the window height to 
 *         calculate the height of the element
 *     
 *     widthOffset: number of pixels subtracted from the window width to 
 *         calculate the width of the element
 */
(function($) {

	var FitWindow = {

		options: {
			heightOffset: 0,
			widthOffset: 0
		},

		_init: function() {
			var heightOffset = typeof this.options.heightOffset == "number" 
								? this.options.heightOffset : 0;
			heightOffset += (this.element.outerHeight(true) - this.element.outerHeight(false));
			var widthOffset = typeof this.options.widthOffset == "number"
								? this.options.widthOffset : 0;
			widthOffset += (this.element.outerWidth(true) - this.element.outerWidth(false));
			var self = this;
			self.element.css({ "width": "100%" });
			var doResize = function() {
				var windowHeight = $(window).height();
				var myHeight = windowHeight - heightOffset;
				self.element.height(myHeight);
				self.element.resize();
			};
			$(window).resize(function(event) {
				doResize();
			});
			doResize();
		}

	};

	$.widget("ui.fitwindow", FitWindow);

})(jQuery);