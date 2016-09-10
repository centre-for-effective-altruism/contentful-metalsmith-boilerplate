var $ = require('jquery');
require('bootstrapTypeahead');

$.fn.searchFactory = function( opts ) {
    // set options
    opts = opts || {};

    var defaults = {
        data: false
    }

    var options = {};
    var props = Object.getOwnPropertyNames(defaults);
    for (var i = 0, j = props.length; i < j; i++) {
        options[props[i]] = opts[props[i]] || defaults[props[i]];
    }

    
    var multipleTypes = false;

    // helper function to open a URL
    function openUrl(item){
        global.location.href = global.location.protocol + '//' + global.location.host + item.canonical;
    }

    // Check whether we need to specify what kind of item the search returns
    function checkMultipleTypes(){
        var check = []; var type;
        for (var i = 0, j = options.data.length; i < j; i++) {
            type = options.data[i].type || null;
            if(type && check.indexOf(type) === -1) {
                check.push(type);
            }
            type = null;
        }
        return check.length > 1;
    }

    function displayText(item){
        if (multipleTypes) return item.type.substr(0,1).toUpperCase() + item.type.substr(1) + ': ' + item.name;
        return item.name;
    }

    return this.each(function() {
        // find elements
        var textInput = $(this);
        var form = $(this).parent('form');
        form.submit(function(event){
            event.preventDefault();
        })

        if(options.data){
            multipleTypes = checkMultipleTypes();
            textInput.typeahead({
                source: options.data,
                displayText: displayText,
                afterSelect: function(item){
                    textInput.val('');
                    openUrl(item);
                }
            });
        } else {
            if(console !== 'undefined' && typeof console.error === 'function') {
                console.error('No data source specified for search');
            }
            textInput.props('disabled',true);
        }
    });


     
};


