$.fn.jsbExp.functions.push({
    type: 'date', 
    name: 'Today', 
    description: 'Returns today\'s date',
    render: function (container, helper, data) {
        container.html('Today');
    }, 
    // there is no edit for this
    edit: null,
    // there is no update for this
    update: null,
    toFunction: function (modelName, helper, data) {
        var js = [];
        js.push('var date = new Date();');
        js.push('date.setHours(0,0,0,0);')
        js.push('return date;');
        return js.join('');
    }
});


