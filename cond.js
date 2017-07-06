
(function ($) {

    // track mouse movement for opening dialogs
    var _mouseX;
    var _mouseY;

    var _optionsStoreName = 'options-store';

    var _getOptions = function (elem) {
        return elem.data(_optionsStoreName);
    }

    var _setOptions = function (elem, options) {
        elem.data(_optionsStoreName, options);
    }

    var _relations = ['EQ', 'NOTEQ', 'GT', 'GTEQ', 'LT', 'LTEQ', 'NULL', 'NOTNULL', 'BETWEEN'];

    var _relationWords = [];
    _relationWords['EQ'] = 'is equal to';
    _relationWords['NOTEQ'] = 'is not equal to';
    _relationWords['GT'] = 'is greater than';
    _relationWords['GTEQ'] = 'is greater than or equal to';
    _relationWords['LT'] = 'is less than';
    _relationWords['LTEQ'] = 'is less than or equal to';
    _relationWords['NULL'] = 'is blank';
    _relationWords['NOTNULL'] = 'is not blank';
    _relationWords['BETWEEN'] = 'is between';

    var _relationSymbols = [];
    _relationSymbols['EQ'] = '===';
    _relationSymbols['NOTEQ'] = '!==';
    _relationSymbols['GT'] = '>';
    _relationSymbols['GTEQ'] = '>=';
    _relationSymbols['LT'] = '<';
    _relationSymbols['LTEQ'] = '<=';
    _relationSymbols['NULL'] = '=== null';
    _relationSymbols['NOTNULL'] = '!== null';
    _relationSymbols['BETWEEN'] = '?????';

    //these relations are only valid on numerics/dates
    var _relationNumerics = [];
     _relationNumerics['GT'] = true;
     _relationNumerics['GTEQ'] = true;
     _relationNumerics['LT'] = true;
     _relationNumerics['LTEQ'] = true;
     _relationNumerics['BETWEEN'] = true;

    var _buildRuleGroup = function (options, group) {
        var html = [];
        var expressions = [];
        html.push('<div class="rule-group-wrap" data-groupid="', group.id, '"><span class="rule-group-condition" data-groupid="', group.id, '">', group.condition === 'and' ? 'And' : 'Or', '</span>')
        html.push('<div class="rule-group" data-groupid="', group.id, '">')
        var rulesToInit = [];
        $.each(group.rules, function (index2, rule) {
            var ruleData = _buildRule(options, rule);
            html.push(ruleData.html);
            $.each(ruleData.expressions, function (index3, item3) {
                expressions.push(item3);
            });
        });
        html.push('<div class="add-rule-wrap"><a href="#" class="add-rule">Add Rule</a></div>');
        html.push('</div>')
        html.push('</div>')
        return {
            html: html.join(''),
            expressions: expressions
        }
    }

    var _buildRule = function (options, rule) {
        var expressions = [];
        /*
        <div class="rule">
            <span class="field">Requested Amount</span><span class="relation">is greater than</span><span class="value">50000</span>
        </div>
        */
        //get the field for this rule
        //debugger;
        var field = _getFieldById(options, rule.field);
        /*
        $.each(options.fields, function (i, f) {
            if (f.id === rule.field) {
                field = f;
                return false;
            }
        });
        if (!field) {
            field = options.fields[0];
        }
        */
        var html = [];
        html.push('<div class="rule" data-ruleid="', rule.id, '">');
        html.push('<a href="#" class="delete-rule" data-ruleid="', rule.id, '">Delete</a>'); 
        html.push('<div class="condition" data-ruleid="', rule.id, '">', rule.condition, '</div>');
        html.push('<div class="field" data-ruleid="', rule.id, '" data-fieldid="' + field.id + '">', field.name, '</div>');
        html.push('<div class="relation" data-ruleid="', rule.id, '">', _relationWords[rule.relation], '</div>');
        var valueElemId = $.fn.jsb.util.getIdString();
        var valueExpElemId = $.fn.jsb.util.getIdString();
        html.push('<div class="value" id="', valueElemId, '" data-ruleid="', rule.id, '">');
        
        if (rule.relation === 'NULL' || rule.relation === 'NOTNULL') {
            // show no value
        } else {
            
            //// do we have an expression?
            //if (rule.valueExp) {

            //    // add this expression for initialization after the dom is updated
            //    expressions.push({
            //        valueDomId: valueElemId,
            //        expressionDomId: valueExpElemId,
            //        data: rule.valueExp
            //    });
            //} else {

                // render value
                var displayValue;

                if (field.values && field.values.length > 0) {
                    // show the lookup values

                    var vals = [];
                    var displays = [];

                    // rule value might be a single value or a lookup
                    if ($.isArray(rule.value)) {
                        vals = rule.value;
                    } else {
                        vals = [rule.value];
                    }
                    //debugger;

                    $.each(vals, function (index, ruleval) {
                        $.each(field.values, function (index2, fieldval) {
                            if (ruleval === fieldval.value) {
                                displays.push(fieldval.display);
                                return false;
                            }
                        });
                    });
                    displayValue = displays.join(' or ');

                } else {
                    // standard value
                    displayValue = rule.value ? rule.value : 'value';
                }

                if (rule.relation === 'BETWEEN') {
                    // show the second value
                    //debugger;
                    if (rule.value2) {
                        displayValue = displayValue + ' and ' + rule.value2;
                    } else {
                        displayValue = displayValue + ' and value';
                    }
                }

                // set it
                html.push('<div data-ruleid="', rule.id, '">', displayValue, '</div>');
            //}
        }

        html.push('</div>');

        // expression
        html.push('<div class="value-exp" id="', valueExpElemId, '" data-ruleid="', rule.id, '"></div>');

        html.push('</div>');
        return {
            html: html.join(''),
            expressions: expressions
        }
    };

    var _buildRelationList = function () {
        var html = [];
        html.push('<div class="list relation-list">');
        for (var i = 0; i < _relations.length; i++) {
            var code = _relations[i];
            html.push('<div class="item relation', _relationNumerics[code] ? ' relation-num"' : '"', 'data-code="', code, '">', _relationWords[code], '</div>');    
        }
        html.push('</div>');
        return html.join('');
    };

    var _buildFieldList = function (options) {
        //debugger;
        var html = [];
        html.push('<div class="list field-list">');
        $.each(options.fields, function (index, item) {
            html.push('<div class="item field" data-fieldid="', item.id ,'">', item.name, '</div>');    
        });
        html.push('</div>');
        return html.join('');
    };

    var _buildValueDialog = function (options) {
        //debugger;
        var html = [];
        html.push('<div class="list value-dialog">');

        // standard values
        html.push('<div class="value-wrap">')

        // single value
        html.push('<div class="value1-wrap">')
        html.push('<input type="text" class="value value1"/>');
        html.push('</div>')

        // second value
        html.push('<div class="value2-wrap">')
        html.push('<div class="value2-and">And</div>');
        html.push('<input type="text" class="value value2"/>');
        html.push('</div>');

        // lookup values
        html.push('<div class="lookup-wrap">');
        // items supplied at runtime
        html.push('</div>');

        html.push('</div>');


        // expression 
        html.push('<div class="exp-wrap">');
        html.push('<div>Expression:</div>');
        html.push('<div class="exp"></div>');
        html.push('</div>');

        // update button
        html.push('<div class="value-dialog-toolbar"><a href="#" class="update" data-ruleid="">Update</a> | <a href="#" class="use-exp" data-ruleid="">Change to Expression</a><a href="#" class="use-value" data-ruleid="">Change to Value</a></div>')
        html.push('</div>');
        return html.join('');
    };

    var _buildScript = function (options, modelName) {
        var script = [];
        var prepValue = function (field, value) {
            var val = 'null';
            if (value) {
                if (field.type === 'string') {
                    val = '\'' + value.replace(new RegExp('\'', 'g'), '\\\'') + '\'';
                } else if (field.type === 'date') {
                    val = 'new Date(\'' + value + '\')';
                } else {
                    val = value;
                }
            }
            return val;
        }
        script.push('(');
        //debugger;
        $.each(options.rules, function (index, group) {
            if (index > 0) {
                // add condition
                script.push(group.condition === 'and' ? ' && ' : ' || ');
            }
            script.push('(');
            $.each(group.rules, function (index2, rule) {
                var field = _getFieldById(options, rule.field);
                var fullField = modelName + '.' + field.id;

                if (index2 > 0) {
                    // add condition
                    script.push(rule.condition === 'and' ? ' && ' : ' || ');
                }
                script.push('(');
                switch (rule.relation) {

                    case 'NULL':
                        script.push('!', fullField);
                        break;

                    case 'NOTNULL':
                        script.push(fullField);
                        break;

                    case 'BETWEEN':
                        script.push(fullField, ' >= ', prepValue(field, rule.value), ' && ', fullField, ' <= ', prepValue(field, rule.value2));
                        break;

                    default:
                        if (rule.valueExp) {
                            // this is an expression
                            var exp = $.fn.jsbExp.build({
                                modelName: modelName,
                                fields: options.fields,
                                tokens: rule.valueExp.tokens
                            });
                            script.push(fullField + ' ' + _relationSymbols[rule.relation] + ' ' + exp.formula);
                        } else if ($.isArray(rule.value)) {
                            // this an array of values
                            var temp = [];
                            $.each(rule.value, function (index2, item) {
                                temp.push(fullField + ' ' + _relationSymbols[rule.relation] + ' ' + prepValue(field, item));
                            });
                            script.push(temp.join(' || '));
                        } else {
                            // just one value
                            script.push(fullField, ' ', _relationSymbols[rule.relation], ' ', prepValue(field, rule.value));
                        }

                }
                script.push(')');
            });
            script.push(')');
            
        });
        script.push(')');
        return script.join('');
    }

    var _initRender = function (options) {
        var html = [];
        var expressions = [];
        html.push('<div class="jsb-cond">');
        html.push('<div><a href="#" class="add-rulegroup">Add Group</a></div>');
        html.push(_buildRelationList());
        html.push(_buildFieldList(options));
        html.push(_buildValueDialog(options));
        html.push('<div class="rules">')
        $.each(options.rules, function (index, group) {
            var groupData = _buildRuleGroup(options, group);
            html.push(groupData.html);
            $.each(groupData.expressions, function (index2, item2) {
                expressions.push(item2);
            });
        });
        html.push('</div>');
        html.push('</div>');
        $(html.join('')).appendTo(options.container);
        // activate all expressions
        //debugger;
        $.each(expressions, function (index, item) {
            $('#' + item.expressionDomId).jsbExp({
                fields: options.fields,
                expression: item.data,
                onChange: function () {
                    $('#' + item.valueDomId).text($(this).jsbExp('getExpression').text);
                }
            })
        });
        _hideFirstCondition(options);
    };

    var _hideFirstCondition = function (options) {
        //debugger;
        var items = options.container.find('.condition');
        items.show();

        // hide the first condititon in each group
        $.each(options.container.find('.rule-group-condition'), function (index, group) {
            if (index === 0) {
                $(group).hide();
                return false;
            }
        });

        // now hide the first condition in each group
        $.each(options.container.find('.rule-group'), function (index, group) {
            $.each($(group).find('.rule .condition'), function (index2, condition) {
                $(condition).hide();
                return false;
            });
        });
        /*
        if (items.length > 0) {
            $(items[0]).hide();
        }
        */
    }

    var _hideLists = function (elem) {
        // hide all lists
        elem.closest('.jsb-cond').find('.list').hide();
    }

    var _showRelationList = function (initiator) {

        // hide all open lists
        _hideLists(initiator);

        // get options 
        var options = _getOptions(initiator.closest('.jsb-cond').parent());

        // get list
        var list = initiator.closest('.jsb-cond').find('.relation-list');
        // show all relations
        list.find('.relation').show();
        
        // get the rule from the initiator
        var rule = initiator.closest('.rule');

        // get the field
        //debugger;
        var field = _getFieldById(options, rule.find('.field').data('fieldid'));

        // is this non-numeric?
        //debugger;
        if (_isFieldNumeric(field) === false) {
            list.find('.relation-num').hide();
        }

        // show the list
        list.data('initiator', initiator).css({'top':_mouseY + 10,'left':_mouseX}).fadeIn();
    };

    var _showValueDialog = function (initiator) {

        // hide all open lists
        _hideLists(initiator);

        // get options 
        var options = _getOptions(initiator.closest('.jsb-cond').parent());

        // get the rule element from the initiator
        var ruleElem = initiator.closest('.rule');

        // get the rule
        var rule = _getRuleById(options, ruleElem.data('ruleid'));

        // get dialog
        var dialogElem = initiator.closest('.jsb-cond').find('.value-dialog');

        // set the rule id on elem for later use
        dialogElem.data('ruleid', ruleElem.data('ruleid'));

        // get the field
        var field = _getFieldById(options, rule.field);

        // setup an expression for this
        dialogElem.find('.exp').jsbExp({
            fields: options.fields,
            expression: rule.valueExp
        });

        // get the value inputs
        var valueInputs = dialogElem.find('input.value');

        // set the input based on field type
        if (_isFieldDate(field)) {
            valueInputs.attr('type', 'date');
        } else if (_isFieldNumeric(field)) {
            valueInputs.attr('type', 'number');
        } else {
            valueInputs.attr('type', 'text');
        }

        // set the value 1
        dialogElem.find('.value1-wrap').show();
        dialogElem.find('.value1').val(rule.value);

        // between has special handling
        dialogElem.find('.value2-wrap').hide();
        if (rule.relation === 'BETWEEN') {
            dialogElem.find('.value2-wrap').show();
            dialogElem.find('.value2').val(rule.value2);
        }

        //valueInput.val(rule.value);
        // lookups have special meaning
        //debugger;
        var lookupWrapElem = dialogElem.find('.lookup-wrap');
        lookupWrapElem.find('.lookup').hide();
        if (field.values && field.values.length > 0) {

            // hide the value fields
            dialogElem.find('.value1-wrap').hide();

            // do we already have a lookup for this field?
            if (lookupWrapElem.find('.lookup-' + field.id).length === 0) {
                // build the new lookup list
                var html = [];
                html.push('<div class="lookup lookup-', field.id, '">');
                $.each(field.values, function (index, item) {
                    var id = $.fn.jsb.util.getIdString();
                    html.push('<div><input type="checkbox" id="', id, '" data-value="' + item.value + '"/>');
                    html.push('<label for="', id, '">', item.display, '</label></div>');
                });
                html.push('</div>');
                $(html.join('')).appendTo(lookupWrapElem);
            }
            var lookupElem = lookupWrapElem.find('.lookup-' + field.id);

            //uncheck all boxes
            lookupElem.find('input[type="checkbox"]').prop('checked', false);

            //debugger;
            // the value might be a single value or an array
            var vals = [];
            if ($.isArray(rule.value)) {
                vals = rule.value;
            } else {
                // create an array with single value
                vals = [rule.value];
            }
            // check matching values
            for (var i = 0; i < vals.length; i++) {
                lookupElem.find('input[data-value="' + vals[i] + '"]').prop('checked', true);
            }
            lookupElem.show();
        }

        // show the dialog
        if (rule.valueExp) {
            // show the expression
            dialogElem.data('usage', 'exp');
            dialogElem.find('.value-wrap').hide();
            dialogElem.find('.value-dialog-toolbar .use-exp').hide();
            dialogElem.find('.value-dialog-toolbar .use-value').show();
            dialogElem.find('.exp-wrap').show();
        } else {
            // show the normal value
            dialogElem.data('usage', 'value');
            dialogElem.find('.value-wrap').show();
            dialogElem.find('.value-dialog-toolbar .use-exp').show();
            dialogElem.find('.value-dialog-toolbar .use-value').hide();
            dialogElem.find('.exp-wrap').hide();
        }
        dialogElem.data('initiator', initiator).css({ 'top': _mouseY + 10, 'left': _mouseX }).fadeIn();
        if (rule.valueExp) {
            // focus expression
            dialogElem.find('.exp-wrap .exp .token').focus();
        } else {
            // select values
            dialogElem.find('.value1').select();
        }
        
    };

    var _toggleValueDialogUsage = function(elem, usage) {
        var dialog = elem.closest('.value-dialog');
        dialog.data('usage', usage);
        dialog.find('.value-wrap').toggle();
        dialog.find('.exp-wrap').toggle();
        dialog.find('.use-exp').toggle();
        dialog.find('.use-value').toggle();
        if (usage === 'exp') {
            // focus expression
            dialog.find('.exp-wrap .exp .token').focus();
        } else {
            dialog.find('.value1').select();
        }
    }

    var _showFieldList = function (initiator) {

        // hide all open lists
        _hideLists(initiator);

        // get list
        var list = initiator.closest('.jsb-cond').find('.field-list');
       
        // show the list
        list.data('initiator', initiator).css({'top':_mouseY + 10,'left':_mouseX}).fadeIn();
    };

    var _addRuleGroup = function (initiator) {

        // hide all lists
        _hideLists(initiator);

        // get options
        var options = _getOptions(initiator.closest('.jsb-cond').parent());
        var group = {
            id: $.fn.jsb.util.getIdString(),
            condition: 'and',
            rules: []
        };
        options.rules.push(group);

        // update the dom
        options.container.find('.rules').append($(_buildRuleGroup(options, group)));
        _hideFirstCondition(options);
        
        // notify user
        _triggerChange(options);
    };

    var _addRule = function (initiator) {
        
        // hide all lists
        _hideLists(initiator);

        // get options
        var options = _getOptions(initiator.closest('.jsb-cond').parent());

        // get group
        var group = _getRuleGroupById(options, initiator.closest('.rule-group').data('groupid'));

        var rule = {
            id: $.fn.jsb.util.getIdString(),
            condition: 'and',
            field: options.fields[0].id, // use the first field
            relation: 'EQ', 
            value: null
        };
        group.rules.push(rule);
        _renderRule(options, rule, group.id);

        // notify user
        _triggerChange(options);
    };

    var _deleteRule = function (initiator) {

        // hide all lists
        _hideLists(initiator);

        // get rule id
        var ruleId = initiator.data('ruleid');

        // get options
        var options = _getOptions(initiator.closest('.jsb-cond').parent());

        // get the rule element
        var ruleElem = options.container.find('.rule[data-ruleid="' + ruleId + '"]');

        // get the group
        var group = _getRuleGroupById(options, ruleElem.closest('.rule-group').data('groupid'));

        // remove the rule and group if it's empty
        $.each(options.rules, function (index, group) {
            $.each(group.rules, function (index2, rule) {
                if (rule.id === ruleId) {
                    group.rules.splice(index2, 1);
                    return false;
                }
            });
            if (group.rules.length === 0) {
                options.rules.splice(index, 1);
                return false;
            }
        });
        
        // remove the dom
        if (group.rules.length === 0) {
            options.container.find($('div.rule-group-wrap[data-groupid="' + group.id + '"]')).remove();
        } else {
            ruleElem.remove();
        }
        
        _hideFirstCondition(options);

        // notify user
        _triggerChange(options);

    };

    var _applyHandlers = function (options) {

        // handler for clicking condition in all groups
        options.container.on('click', '.add-rulegroup', function () {
            //debugger;
            _addRuleGroup($(this));
        });

        // handler for clicking condition in all groups
        options.container.on('click', '.rule-group-condition', function () {
            //debugger;
            _changeGroupCondition($(this));
        });

        // handler for clicking condition in all rules
        options.container.on('click', '.rule .condition', function () {
            //debugger;
            _changeCondition($(this));
        });

        // handler for clicking field in all rules
        options.container.on('click', '.rule .field', function () {
            _showFieldList($(this));
        });

        // handler for clicking relations in all rules
        options.container.on('click', '.rule .relation', function () {
            _showRelationList($(this));
        });

        // handler for clicking value in all rules
        options.container.on('click', '.rule .value', function () {
            if ($(this).hasClass('jsb-exp')) {
                // do nothing - let expression builder handle it
            } else {
                _showValueDialog($(this));
            }
            
        });

        // handler for adding a rule
        options.container.on('click', '.add-rule', function () {
            _addRule($(this));
        });

        // handler for deleting a rule
        options.container.on('click', '.delete-rule', function () {
            _deleteRule($(this));
        });

        // handler updating value
        options.container.on('click', '.value-dialog-toolbar .update', function () {
            _changeValue($(this));
        });
        // handler to use expression
        options.container.on('click', '.value-dialog-toolbar .use-exp', function () {
            _toggleValueDialogUsage($(this), 'exp');
        });
        // handler to use value
        options.container.on('click', '.value-dialog-toolbar .use-value', function () {
            _toggleValueDialogUsage($(this), 'value');
        });

        // handler for tracking mouse for showing dialogs
        $(document).mousemove( function(e) {
            _mouseX = e.pageX; 
            _mouseY = e.pageY;
        });

        // handler for clicking on an relation in the list
        $('.jsb-cond .relation-list .relation').click(function() {
            var relation = $(this);
            var list = relation.parent();
            var options = _getOptions(list.data('initiator').closest('.jsb-cond').parent());
            var ruleId = list.data('initiator').closest('.rule').data('ruleid');

            _changeRelation(options, ruleId, relation.data('code'));
            //list.data('initiator').html(relation.html());
            list.fadeOut();
        });

        // handler for clicking on an field in the list
        $('.jsb-cond .field-list .field').click(function() {
            var field = $(this);
            var list = field.parent();
            var options = _getOptions(list.data('initiator').closest('.jsb-cond').parent());
            var ruleId = list.data('initiator').closest('.rule').data('ruleid');

            _changeField(options, ruleId, field.data('fieldid'));
            //list.data('initiator').html(relation.html());
            list.fadeOut();
        });
    };

    var _isFieldNumeric = function (field) {
        var isNumeric = false;
        var type = field.type;
        //debugger;
        if (type === 'integer' && field.values) {
            // this is a lookup.  treat as non-numeric
            isNumeric = false;
        } else {
            if (type === 'integer' || type === 'decimal' || type === 'money' || type === 'date')
                isNumeric = true;
            else
                isNumeric = false;    
        }
        return isNumeric;
    }

    var _isFieldDate = function (field) {
        var isDate = false;
        var type = field.type;
        //debugger;
        if (type === 'date') {
            isDate = true;
        }
        return isDate;
    }

    var _changeGroupCondition = function (initiator) {
        // hide all lists
        _hideLists(initiator);

        // get rule id
        var groupId = initiator.data('groupid');

        // get options
        var options = _getOptions(initiator.closest('.jsb-cond').parent());

        // get the group
        var group = _getRuleGroupById(options, groupId);

        // toggle condition
        group.condition = group.condition === 'and' ? 'or' : 'and';

        // change dom
        initiator.html(group.condition === 'and' ? 'And' : 'Or');

        // notify user
        _triggerChange(options);
    }

    var _changeRelation = function (options, ruleId, relation) {
        //debugger; 
        // get the rule
        var rule = _getRuleById(options, ruleId);
        rule.relation = relation;
        _renderRule(options, rule);
        // notify user
        _triggerChange(options);
    }

    var _changeField = function (options, ruleId, fieldId) {
        //debugger; 
        // get the rule
        var rule = _getRuleById(options, ruleId);
        rule.field = fieldId;
        // reset the rule
        rule.relation = 'EQ';
        rule.value = null;
        _renderRule(options, rule);
        // notify user
        _triggerChange(options);
    }

    var _changeCondition = function (initiator) {
        // hide all lists
        _hideLists(initiator);

        // get rule id
        var ruleId = initiator.data('ruleid');

        // get options
        var options = _getOptions(initiator.closest('.jsb-cond').parent());

        // get the rule
        var rule = _getRuleById(options, ruleId);
        
        // toggle condition
        rule.condition = rule.condition === 'and' ? 'or' : 'and';

        // render
        _renderRule(options, rule);

        // notify user
        _triggerChange(options);
    }

    var _changeValue = function (initiator) {
        // hide all lists
        _hideLists(initiator);

        // get a ref to the value dialog
        var dialogElem = initiator.closest('.value-dialog');

        // get rule id
        var ruleId = dialogElem.data('ruleid');

        // get options
        var options = _getOptions(initiator.closest('.jsb-cond').parent());

        // get the rule
        var rule = _getRuleById(options, ruleId);

        // get the field
        var field = _getFieldById(options, rule.field);

        if (dialogElem.data('usage') === 'exp') {
            // this is an expression
            rule.valueExp = dialogElem.find('.exp').jsbExp('getExpression');
            rule.value = rule.valueExp.text;
            
        } else {
            // normal values
            rule.valueExp = null;
            if (field.values && field.values.length > 0) {
                // this field is a lookup
                // go through all checkboxes and make an array
                var vals = [];
                $.each(dialogElem.find('.lookup-' + field.id).find('input[type="checkbox"]'), function (index, item) {
                    var elem = $(item);
                    if (elem.prop('checked')) {
                        vals.push(elem.data('value'));
                    }
                });
                rule.value = vals;
            } else {
                // update the value
                rule.value = dialogElem.find('.value1').val();
                rule.value2 = dialogElem.find('.value2').val();
            }
        }
        
        // render
        _renderRule(options, rule);

        // notify user
        _triggerChange(options);
    }

    var _getRuleGroupById = function (options, groupId) {
        var group = {};
        $.each(options.rules, function (index, item) {
            if (item.id === groupId) {
                group = item;
                return false;
            }
        });
        return group;
    }

    var _getRuleById = function (options, ruleId) {
        var ret;
        $.each(options.rules, function (index, group) {
            $.each(group.rules, function (index2, rule) {
                if (rule.id === ruleId) {
                    ret = rule;
                    return false;
                }
            });
            if (ret) {
                return false;
            }
        });
        return ret;
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

    var _renderRule = function (options, rule, groupId) {
        var ruleData = _buildRule(options, rule);
        var ruleElem = options.container.find('.rule[data-ruleid="' + rule.id + '"]')
        //debugger;
        if (ruleElem.length > 0) {
            ruleElem.replaceWith($(ruleData.html));
        } else {
            $(ruleData.html).insertBefore(options.container.find('.jsb-cond .rule-group[data-groupid="' + groupId + '"] .add-rule-wrap'));
        }
        _hideFirstCondition(options);
    }

    var _triggerChange = function (options) {
        if ($.isFunction(options.onChange)) {
            options.onChange.call(options.container);
        }
    }

    var methods = {

        init: function (options) {

            // Establish our default settings
            var opt = $.extend({
                fields: [], 
                rules: [],
                onChange: null
            }, options);

            // make sure all rule groups have an id
            $.each(opt.rules, function (index, group) {
                group.id = group.id ? group.id : $.fn.jsb.util.getIdString();
                
                // make sure all rules have an id
                $.each(group.rules, function (index2, rule) {
                    rule.id = rule.id ? rule.id : $.fn.jsb.util.getIdString();
                });
            });
            
            // set the id prefix with the count of jsb-cond in the dom
            _idPrefix = $('.jsb-cond').length;

            /*
            Example data:
            {
                fields: [{
                    id: 'RequestedAmount',
                    name: 'Requested Amount',
                    type: 'money'
                },{
                    id: 'SubProductId',
                    name: 'Sub Product',
                    type: 'integer', 
                    values: [{
                        value: 1,
                        display: 'Credit Card'
                    },{
                        value: 2,
                        display: 'Auto Loan'
                    }]
                }],
                rules: [{
                    condition: 'and',
                    id: 1, 
                    field: 'RequestedAmount', 
                    relation: 'GTEQ', 
                    value: 50000
                }]
            };
            */

            return this.each(function () {

                // get ref
                var $this = $(this);

                // store ref to container
                opt.container = $this;
                
                // store the settings on the element
                _setOptions($this, opt);

                // do stuff
                _initRender(opt);
                
                // add click handlers, etc
                _applyHandlers(opt);

            });

        }, 

        getCondition: function (modelName) {
            var options = _getOptions($(this));
            var cond = {
                rules: options.rules,
                formula: _buildScript(options, modelName)
            };
            return cond;
        }
    };

    $.fn.jsbCond = function (methodOrOptions) {
        
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {
            // Default to "init"
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on jQuery.plugin');
        }       
    };

    

}(jQuery));