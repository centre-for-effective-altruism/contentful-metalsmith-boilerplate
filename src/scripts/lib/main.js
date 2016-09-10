
var $ = require('jQuery');
var debounce = require('throttle-debounce').debounce;
// var validate = require('validate.js');

var window = global;

$('document').ready(function(){
    
    function windowScrollOnHashChange(){
        // code to make the window scroll smoothly on hash change move back by 
        var navHeight = $('#navbar-main').outerHeight() + 20;
        var scrollHash = function(event) {
          scrollBy(0, -navHeight);
        };
        if (location.hash) scrollHash();
        $(window).on("hashchange", scrollHash);
    }

    function toggleMinimalMenuBar(){
        // show and hide the menu bar background/logo depending on whether the main logo is showing

        var mainLogo = $('#header-logo');
        var nav = $('#navbar-main');
        if(!mainLogo.length){
            nav.removeClass('nav-minimal');
            return;
        }
        var logoOffset,navOffset;
        function calculateOffsets(){
            logoOffset = mainLogo.offset().top + (mainLogo.outerHeight() / 2);
            navOffset = nav.offset().top + nav.outerHeight();
        }
        function setNavClasses(){
            if(navOffset < logoOffset){
                nav.addClass('nav-minimal')
            } else {
                nav.removeClass('nav-minimal')
            }
        }
        function run(){
            calculateOffsets();
            setNavClasses();
        }
        run();
        $(document).ready(run);
        $(document).scroll(debounce(100,run));
        $(document).resize(debounce(100,run));
        nav.mouseover(function(){nav.removeClass('nav-minimal')});
        nav.mouseout(run);
    }

    // function validationFactory() {

    //     $.fn.validate = function(rules, callback) {
    //         if(typeof rules !== 'object' || typeof rules === null){
    //             throw new Error ('No rules object provided')
    //         }

    //         var el = $(this);

    //         el.on('submit',function(event){
    //             var el = $(this);
    //             event.preventDefault();
    //             if(validateWrapper(el,rules)){
    //                 // run the callback if it's been set, otherwise submit the form
    //                 if(typeof callback === 'function'){
    //                     callback(el);
    //                 } else {
    //                     el.submit();
    //                 }
    //             }
    //         });

    //         function validateWrapper (form,rules){
    //             var validationErrors = validate(form,rules)
                
    //             if(validationErrors){
    //                 for (var error in validationErrors) {
    //                     if(validationErrors.hasOwnProperty(error)) {
    //                         var el = $('[name='+error+']')

    //                         el.parent('.form-group,.input-group')
    //                         .addClass('has-error')

    //                         el
    //                         .tooltip('hide')
    //                         .tooltip('destroy')
    //                         .tooltip({title:validationErrors[error][0],trigger:"manual",placement:"auto bottom"})
    //                         .tooltip('show')
    //                         .on('focus change',function(){
    //                             $(this)
    //                             .tooltip('hide')
    //                             .tooltip('destroy');

    //                             $(this).parent('.form-group,.input-group')
    //                             .removeClass('has-error');
    //                         })
    //                     }
    //                 }
    //                 return false;
    //             }
    //             return true;
    //         }
    //     }; 
    // }

    windowScrollOnHashChange();
    toggleMinimalMenuBar();
    // validationFactory();
});
