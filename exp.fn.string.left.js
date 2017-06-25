
// Left
$.fn.jsbExp.functions.push({
    type: 'string',
    name: 'Left', 
    description: 'Returns the left-most characters of a field',
    render: function (container, helper, data) {
        var field = helper.getFieldById(data.fieldId);
        var html = 'Left(' + field.name + ', ' + data.numChars + ')';
        container.html(html);
    }, 
    edit: function (container, helper, data) {
        var html = [];
        html.push('<label>Choose Field:</label><div>', helper.getFieldSelectorHtml(data.fieldId), '</div>');
        html.push('<br/><label>Number of characters:</label><div><input type="number" class="form-control num-chars" value="', data.numChars ? data.numChars : '', '"/></div>');
        $(html.join('')).appendTo(container);
        //container.html('left(field, 3)');
    }, 
    update: function (container, helper, data) {
        //debugger;
        var field = helper.getSelectedField();
        if (!container.find('.num-chars').val()) {
            helper.error('Enter the Number of characters');
            return false;
        }
        data.fieldId = field.id;
        data.numChars = container.find('.num-chars').val();
        return true;
    },
    toFunction: function (modelName, helper, data) {
        var field = helper.getFieldById(data.fieldId);
        var js = [];
        js.push('var ret = \'\';');
        js.push('var n = ', data.numChars, ';');
        js.push('if (!', modelName, '.', field.id, ') return ret;');
        js.push('if (n > ', modelName, '.', field.id, '.toString().length) return ', modelName, '.', field.id, '.toString();');
        js.push('return ', modelName, '.', field.id, '.toString().substring(0, n);');
        return js.join('');
    }
});


