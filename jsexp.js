
(function ($) {

    var _tests = {
        allValidKeys: new RegExp("^[()+-//*0-9\.fF]+$"),
        operator: new RegExp("^[+-//*]+$"),
        value: new RegExp("^[0-9\.fF]+$"),
        parens: new RegExp("^[()]+$"), 
        field: new RegExp("^[fF]+$")
    }
    var _optionsStoreName = 'options-store';

    var _getOptions = function (elem) {
        return elem.data(_optionsStoreName);
    }

    var _setOptions = function (elem, options) {
        elem.data(_optionsStoreName, options);
    }

    var _init = function (elem, options) {
        var html = [];
        options.container = elem;
        html.push('<div class="input" tabindex="0"></div>');
        elem.addClass('jsexpexp');  
        $(html.join('')).appendTo(elem);
        _applyHandlers(elem, options);
        elem.find('div.input').first().focus();
    }

    var _applyHandlers = function(elem, options) {

        elem.on('keydown', '.input', function (event) {
            var elem = $(this);
            var key = _normalizeKey(event);
            _keyDown(elem, options, event, key);
        });
    }

    var _normalizeKey = function (event) {

        var key;
        var keyCode = event.keyCode || event.which; 
        if (keyCode === 9) {
            if (event.shiftKey) {
                key = 'SHIFTTAB';
            } else {
                key = 'TAB';
            }
        } else if (keyCode === 37) {
            key = 'LEFT';
        } else if (keyCode === 39) {
            key = 'RIGHT';
        } else {
            key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
            //console.log(event.which);
            switch (keyCode) {
                case 8:
                    key = 'DEL';
                    break;
                case 191: 
                    key = '/';
                    break;
                case 189: 
                    key = '-';
                    break;
                case 187: 
                    if (event.shiftKey)
                        key = '+';
                    break;
                case 107:
                    key = '+';
                    break;
                case 106:
                    key = '*';
                    break;
                case 56:
                    if (event.shiftKey)
                        key = '*';
                    break;
                case 190: 
                    key = '.';
                    break;
                case 168:
                    key = '(';
                    break;
                case 169:
                    key = ')';
                    break;
                case 57:
                    if (event.shiftKey)
                        key = '(';
                    break;
                case 48:
                    if (event.shiftKey)
                        key = ')';
                    break;
            }
        } 
        return key;
    }
    
    var _next = function(elem, options) {
        //elem.next().attr('readonly', false).select();
        if (elem.next().length === 0) {
            // create new div
            var tabIndex = parseInt(elem.attr('tabindex')) + 1;
            //var className = elem.hasClass('operator') ? 'value' : 'operator';
            $('<div class="input" tabindex="' + tabIndex + '"></div>').appendTo(elem.parent());
        } 
        return elem.next().focus(); 
    }

    var _prev = function(elem, options) {
        //elem.next().attr('readonly', false).select();
        return elem.prev().focus();
    }

    var _keyDown = function (elem, options, event, key) {
        if (key === 'TAB' || key === 'SHIFTTAB' || key === 'LEFT' || key === 'RIGHT') {
            // this is navigation
            event.preventDefault(); 
            if (key === 'SHIFTTAB' || key === 'LEFT') {
                _prev(elem);
            } else {
                _next(elem);
            }
            return;
        } 

        if (key === 'DEL') {
            // delete key...empty element
            elem.empty();
            // change event
            if ($.isFunction(options.onChange)) {
                options.onChange.call(options.container);
            }
        } else {
            // validate key and quit if bad
            if (!_tests.allValidKeys.test(key)) {
                // bad
                event.preventDefault();
                return;
            }
            // get the previous key to know what's allowed
            var prevKey;
            if (elem.prev().length > 0) {
                prevKey = elem.prev().html();
            }
            var existingValue = elem.html();
            if (!existingValue && _tests.operator.test(prevKey) && _tests.operator.test(key) ) {
                // cant have two operators together
                // dont do this check unless the existing div is empty
                event.preventDefault();
                return;
            } else if (_tests.value.test(prevKey) && _tests.value.test(key)) {
                // cant have two values together
                event.preventDefault();
                return;
            }
            
            if (_tests.field.test(key)) {
                alert('open field');
            } else {
                if (_tests.value.test(elem.html()) && (_tests.operator.test(key) || _tests.parens.test(key))) {
                    // we're in value, but entered operator/paren
                    // move to the next div and set it with this key
                    var next = _next(elem, options);
                    _keyDown(next, options, event, key);
                    return;
                }
                //div - update content
                if (_tests.operator.test(elem.html())) {
                    // replace
                    elem.html(key);
                } else {
                    // append
                    elem.html(elem.html() + key);
                }
                
                // auto-advance?
                if (_tests.operator.test(elem.html()) || key === '(' || key === ')') {
                    _next(elem, options);
                }

                // change event
                if ($.isFunction(options.onChange)) {
                    options.onChange.call(options.container);
                }
            }
        }
    }
    var methods = {

        init: function (options) {

            // Establish our default settings
            var opt = $.extend({
                fields:[],
                items: []
            }, options);

            console.log(opt.fields)
            return this.each(function () {

                // get ref
                var $this = $(this);

                // store the settings on the element
                _setOptions($this, opt);

                // do stuff
                _init($this, opt);
            });

        }, 

        getExpression: function () {
            // do stuff
            var options = _getOptions($(this));
            var exp = [];
            $.each($(this).find('.input'), function(index, item) {
                exp.push($(item).html())
            });
            var formula = exp.join('');
            return formula;
        }
    };

    $.fn.jsexpexp = function (methodOrOptions) {
        
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.plugin');
        }       
    }

    
}(jQuery));
