// Handler for newsletter signup form
;(function($,cookies){
    $(document).on('jsready',function(){
        $('.newsletter-signup-subscribe').removeClass('disabled');
    });

    var rules = {
        EMAIL: {
            email: true,
            presence: true
        }
    };

    $('.newsletter-signup-form').validate(rules, function(form){
        var url = form.attr('action').replace('/post?', '/post-json?').concat('&c=?');
        var requestData = {};
        var resultDiv = form.find('.newsletter-signup-result');
        var submitButton = form.find('.newsletter-signup-subscribe');
        
        resultDiv
        .removeClass('hidden')
        .removeClass('alert-danger')
        .removeClass('alert-success')
        .addClass('alert-info')
        .text('Processing...');

        submitButton
        .addClass('disabled')
        .removeClass('btn-success')
        .addClass('btn-default');

        // based on https://github.com/scdoshi/jquery-ajaxchimp/blob/dev-2.0/src/jquery.ajaxchimp.js
        $.each(form.serializeArray(), function (index, item) {
            requestData[item.name] = item.value;
        });
        $.ajax({
                method: 'GET',
                url: url,
                data: requestData,
                dataType: 'json',
                contentType: "application/json; charset=utf-8",

        })
        .done(function (data) {
            if (data.result === 'success') {
                form.find('.controls').addClass('hidden');
                resultDiv
                .removeClass('alert-danger')
                .removeClass('alert-info')
                .addClass('alert-success')
                .html('<strong>Success:</strong> a confirmation email has been sent to ' + requestData.EMAIL + '. Thanks for subscribing!');

                cookies.set('newsletter_subscribed','1',{expires:365});
            } else{
                try {
                    var parts = data.msg.split(' - ', 2);
                    if (parts[1] === undefined) {
                        msg = data.msg;
                    } else {
                        msg = parts[1];
                    }
                }
                catch (e) {
                    msg = data.msg;
                }
                resultDiv
                .removeClass('alert-success')
                .addClass('alert-danger')
                .html("<strong>Error:</strong> "+msg);

                submitButton
                .removeClass('disabled')
                .addClass('btn-success')
                .removeClass('btn-default');
            }
            form.trigger('newsletter_signup',{
                status:     data.result,
                email:      requestData.EMAIL,
                firstName:  requestData.FNAME, 
                lastName:   requestData.LNAME 
            });
        });
    });


})(jQuery,cookies);