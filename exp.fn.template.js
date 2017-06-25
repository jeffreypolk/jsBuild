$.fn.jsbExp.functions.push({
    // string, numeric, date
    type: '', 
    // the name of the function
    name: '', 
    // the description of the function
    description: '',
    // method to render the function in the expression
    render: function (container, helper, data) {
        container.html('<span>this is the markup shown in the expression line</span>');
    }, 
    // method to build the edit form
    edit: function (container, helper, data) {
        $('<span>this is the markup in the edit dialog</span>').appendTo(container);
    }, 
    // method to update the data stored for this function
    update: function (container, helper, data) {
        // update the data object holding all settings for this function
        data.param1 = 1;
        return true;
    },
    // method to generate a function to execute the function
    // the string return from this method is wrapped in an anonymous function: function(){   <method result>   }()
    toFunction: function (modelName, helper, data) {
        var js = [];
        js.push('var ret = \'\';');
        js.push('return ret;');
        return js.join('');
    }
});


