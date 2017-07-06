
if (!$.fn.jsb)
	$.fn.jsb = {};

$.fn.jsb = $.fn.jsb ? $.fn.jsb : {};

if (!$.fn.jsb.util) {
	$.fn.jsb.util = function () {
		var id = -1;
		var ret = {
			getId: function () {
				id++;
				return id;
			},

			getIdString: function () {
				return 'jsb-' + ret.getId();
			}
		}
		return ret;
	}();
}
