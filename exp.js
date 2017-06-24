
(function ($) {

    var _tests = {
        allValidKeys: new RegExp("^[()+-//*0-9\.=]+$"),
        operator: new RegExp("^[+-//*]+$"),
        value: new RegExp("^[0-9\.=]+$"),
        parens: new RegExp("^[()]+$"),
        functions: new RegExp("^=$")
    }
    var _optionsStoreName = 'options-store';

    var _getOptions = function (elem) {
        return elem.data(_optionsStoreName);
    }

    var _setOptions = function (elem, options) {
        elem.data(_optionsStoreName, options);
    }

    var _hideLists = function (elem) {
        // hide all lists
        elem.closest('.jsb-exp').find('.list').hide();
    }

    var _buildFunctionEditor = function (options) {
        var html = [];
        html.push('<div class="list function-editor">');
        html.push('<div class="name"></div>');
        html.push('<div class="description"></div>');
        html.push('<hr><div class="canvas"></div>');
        html.push('<hr><div class="actions"><a class="editor-update" href="#">Update</a>&nbsp;&nbsp;<a class="editor-cancel" href="#">Cancel</a></div></div>')
        return html.join('');
    }

    var _buildFunctionHelper =  function (options) {
        var ret = {};
        var html = [];

        // field selector
        html = [];
        html.push('<div><select class="field-selector">')
        $.each(options.fields, function (index, item) {
            html.push('<option value="', item.id, '">', item.name, '</option>');
        });
        html.push('</select></div>');
        ret.fieldSelectorHtml = html.join('');
        
        // fields
        ret.fields = options.fields;

        return ret;    
    }

    var _init = function (elem, options) {
        var html = [];
        options.container = elem;
        options.functionHelper = _buildFunctionHelper(options);
        html.push(_buildFunctionEditor(options));
        html.push('<div class="input" tabindex="0">0</div>');
        elem.addClass('jsb-exp');
        $(html.join('')).appendTo(elem);
        _applyHandlers(elem, options);
        elem.find('div.input').first().focus();
    }

    var _applyHandlers = function (elem, options) {

        // handler for all keystrokes in input divs
        elem.on('keydown', '.input', function (event) {
            var elem = $(this);
            var key = _normalizeKey(event);
            _keyDown(elem, options, event, key);
        });

        // handler for clicking on fields/functions
        elem.on('click', '.function-list .item', function (event) {
            _selectFieldFunction($(this), options);
        });

        // handler for canceling function editor
        elem.on('click', '.editor-cancel', function (event) {
            var editor = elem.find('.function-editor');
            editor.hide();
            // focus initiator
            editor.data('initiator').focus();
        });

    }

    var _normalizeKey = function (event) {

        var key;
        var keyCode = event.keyCode || event.which;
        if (keyCode === 9) {
            // tab
            if (event.shiftKey) {
                key = 'PREV';
            } else {
                key = 'NEXT';
            }
        } else if (keyCode === 37) {
            // left arrow
            key = 'PREV';
        } else if (keyCode === 39 || keyCode === 13) {
            // right arrow, enter
            key = 'NEXT';
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
                    key = '='
                    if (event.shiftKey)
                        key = '+';
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
                case 116:
                    key = 'REFRESH';
                    break;
                case 96:
                    key = '0';
                    break;
                case 97:
                    key = '1';
                    break;
                case 98:
                    key = '2';
                    break;
                case 99:
                    key = '3';
                    break;
                case 100:
                    key = '4';
                    break;
                case 101:
                    key = '5';
                    break;
                case 102:
                    key = '6';
                    break;
                case 103:
                    key = '7';
                    break;
                case 104:
                    key = '8';
                    break;
                case 105:
                    key = '9';
                    break;
                case 106:
                    key = '*';
                    break;
                case 107:
                    key = '+';
                    break;
                case 109:
                    key = '-';
                    break;
                case 110:
                    key = '.';
                    break;
                case 111:
                    key = '/';
                    break;
            }
        }
        return key;
    }

    var _next = function (elem, options) {
        //elem.next().attr('readonly', false).select();
        if (elem.next().length === 0) {
            // create new div
            var tabIndex = parseInt(elem.attr('tabindex')) + 1;
            //var className = elem.hasClass('operator') ? 'value' : 'operator';
            $('<div class="input" tabindex="' + tabIndex + '"></div>').appendTo(elem.parent());
        }
        return elem.next().focus();
    }

    var _prev = function (elem, options) {
        //elem.next().attr('readonly', false).select();
        return elem.prev().focus();
    }

    var _keyDown = function (elem, options, event, key) {
        if (key === 'REFRESH') {
            window.location.href = window.location.href;
            return;
        }

        _hideLists(elem);

        if (key === 'PREV' || key === 'NEXT') {
            // this is navigation
            event.preventDefault();
            if (key === 'PREV') {
                _prev(elem);
            } else {
                _next(elem);
            }
            return;
        }

        if (key === 'DEL') {
            // is the element already empty?
            if (!elem.html()) {
                _keyDown(_prev(elem, options), options, event, 'DEL');
                return;
            } else {
                // delete key...empty element
                elem.empty();
            }
            
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
            if (!existingValue && _tests.operator.test(prevKey) && _tests.operator.test(key)) {
                // cant have two operators together
                // dont do this check unless the existing div is empty
                event.preventDefault();
                return;
            } else if (_tests.value.test(prevKey) && _tests.value.test(key)) {
                // cant have two values together
                event.preventDefault();
                return;
            }

            if (_tests.functions.test(key)) {
                // open functions
                event.preventDefault();
                _showFunctionList(elem, options);
                return;
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

    var _showFunctionList = function (elem, options) {
        //debugger;
        if (options.container.find('.function-list').length === 0) {
            var html = [];
            html.push('<div class="list function-list">');
            html.push('<fieldset><legend>Fields</legend>');
            $.each(options.fields, function (index, field) {
                html.push('<div><span class="item" data-type="field" data-fieldid="', field.id, '">', field.name, '</span></div>');
            });
            html.push('</fieldset><br/><br/>');
            html.push('<fieldset><legend>Functions</legend>');
            $.each($.fn.jsbExp.functions, function (index, fn) {
                html.push('<div><span class="item" data-type="function" data-name="', fn.name, '" title="', fn.description, '">', fn.name, '</span></div>');
            });
            html.push('</fieldset>');
            html.push('</div>');
            $(html.join('')).prependTo(options.container);
        }
        // show the list
        options.container.find('.function-list').data('initiator', elem).css({'top':elem.offset().top + elem.height() + 10, 'left':elem.offset().left}).fadeIn();
    }

    var _showFunctionEditor = function (elem, fn, options) {
        //debugger;
        var editor = options.container.find('.function-editor');
        editor.find('.name').html(fn.name);
        editor.find('.description').html(fn.description);
        var canvas = editor.find('.canvas');
        canvas.empty();
        fn.edit(canvas, options.functionHelper, {});
        // show the list
        editor.data('initiator', elem).css({'top':elem.offset().top + elem.height() + 10, 'left':elem.offset().left}).fadeIn();
    }

    var _selectFieldFunction = function (elem, options) {
        _hideLists(elem);
        var initiator = elem.closest('.function-list').data('initiator');
        if (elem.data('type') === 'field') {
            var field = _getFieldById(options, elem.data('fieldid'));
            initiator.data('type', 'field');
            initiator.data('fieldid', field.id);
            initiator.html(field.name);
        } else {
            // this is a function
            var fn = _getFunctionByName(elem.data('name'));
            //initiator.empty();
            _showFunctionEditor(initiator, fn, options);
        }
    }

    var _getFieldById = function (options, fieldId) {
        //debugger;
        var field = {};
        $.each(options.fields, function(index, item) {
            if (item.id === fieldId) {
                field = item;
                return false;
            }
        });
        return field;
    }

    var _getFunctionByName = function (name) {
        //debugger;
        var fn = {};
        $.each($.fn.jsbExp.functions, function(index, item) {
            if (item.name === name) {
                fn = item;
                return false;
            }
        });
        return fn;
    }

    

    var methods = {

        init: function (options) {

            // Establish our default settings
            var opt = $.extend({
                fields: [],
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
            var options = _getOptions($(this));
            var exp = [];
            $.each($(this).find('.input'), function (index, item) {
                if (exp.length > 0) {
                    exp.push(' ');
                }
                exp.push($(item).html())
            });
            var formula = exp.join('');
            return formula;
        }
    };

    $.fn.jsbExp = function (methodOrOptions) {

        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.plugin');
        }
    }

    // define functions in exp.functions.js
    // custom functions can be added by adding to this array by the client
    $.fn.jsbExp.functions = [];

}(jQuery));
