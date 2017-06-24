
// Left
$.fn.jsbExp.functions.push({
    type: 'string',
    name: 'Left', 
    description: 'Returns the left-most characters of a field',
    render: function (container, helper, data) {
        container.html('left(field, 3)');
    }, 
    edit: function (container, helper, data) {
        var html = [];
        html.push('<div>Choose Field:</div><div>', helper.fieldSelectorHtml, '</div>');
        html.push('<br/><div>Number of characters:</div><div><input type="number"/></div>');
        $(html.join('')).appendTo(container);
        //container.html('left(field, 3)');
    }, 
    formula: function (container, helper, data) {

    }
});


// Right
$.fn.jsbExp.functions.push({
    type: 'string',
    name: 'Right', 
    description: 'Returns the right-most characters of a field',
    render: function (container, helper, data) {
        container.html('right(field, 3)');
    }, 
    edit: function (container, helper, data) {
        var html = [];
        html.push('<div>Choose Field:</div><div>', helper.fieldSelectorHtml, '</div>');
        html.push('<br/><div>Number of characters:</div><div><input type="number"/></div>');
        $(html.join('')).appendTo(container);
        //container.html('left(field, 3)');
    }, 
    formula: function (container, helper, data) {

    }
});
