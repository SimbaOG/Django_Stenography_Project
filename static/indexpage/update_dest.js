/**
 * --------------------------------------------------------------------
 * jQuery customfileinput plugin
 * Author: Scott Jehl, scott@filamentgroup.com
 * Copyright (c) 2009 Filament Group 
 * licensed under MIT (filamentgroup.com/examples/mit-license.txt)
 * --------------------------------------------------------------------
 */


/**
 * Modifications: Terry Young (terryyounghk at gmail dot com)
 *
 * ##1: Added 'option' parameter. Initially for optionally specifying a width. Default is 'inherit' (i.e. not specified)
 * ##2: Added options 'buttonText', 'inputText' and 'changeText'
 * ##3: Added option 'maxFileSize'. For this technique, @see: http://www.tizag.com/htmlT/htmlupload.php
 * ##4: Added auto-truncating the file name if text exceeds the available width (Uses the window.onresize event)
 * ##5: Added option 'showInputText'. Default is true
 * ##6: Added event handler 'onChange'
 */
$.fn.customFileInput = function(options){

    // ##1 ++
    var defaults = {
        width: 'inherit',
        buttonText: 'Browse',
        changeText: 'Change',
        inputText: 'No file selected',
        showInputText: true,
        maxFileSize: 0, // ##3 ++

        onChange: $.noop
    };

    // ##1 ++
    var opts = $.extend(true, {}, defaults, options);

    //apply events and styles for file input element
    var fileInput = $(this)
        .addClass('customfile-input') //add class for CSS
        .mouseover(function(){ upload.addClass('customfile-hover'); })
        .mouseout(function(){ upload.removeClass('customfile-hover'); })
        .focus(function(){
            upload.addClass('customfile-focus'); 
            fileInput.data('val', fileInput.val());
        })
        .blur(function(){ 
            upload.removeClass('customfile-focus');
            $(this).trigger('checkChange');
         })
         .bind('disable',function(){
             fileInput.attr('disabled',true);
            upload.addClass('customfile-disabled');
        })
        .bind('enable',function(){
            fileInput.removeAttr('disabled');
            upload.removeClass('customfile-disabled');
        })
        .bind('checkChange', function(){
            if(fileInput.val() && fileInput.val() != fileInput.data('val')){
                fileInput.trigger('change');
            }
        })
        .bind('change', function() {
            // ##5 ++
            if (opts.showInputText) {

                //get file name
                var fileName = $(this).val().split(/\\/).pop();

                $(this).data('text', fileName);

                //get file extension
                var fileExt = 'customfile-ext-' + fileName.split('.').pop().toLowerCase();

                //change text of button
                // uploadButton.text('Change'); // ##2 --
                uploadButton.text(opts.changeText); // ##2 ++

                //update the feedback
                uploadFeedback
                    .text(fileName) //set feedback text to filename
                    .removeClass(uploadFeedback.data('fileExt') || '') //remove any existing file extension class
                    .addClass(fileExt) //add file extension class
                    .data('fileExt', fileExt) //store file extension for class removal on next change
                    .addClass('customfile-feedback-populated'); //add class to show populated state


                autoTruncateFileName();
            }

            if ($.isFunction(opts.onChange)) {
                opts.onChange.apply(this, arguments);
            }
        })
        .click(function(){ //for IE and Opera, make sure change fires after choosing a file, using an async callback
            fileInput.data('val', fileInput.val());
            setTimeout(function(){
                fileInput.trigger('checkChange');
            },100);
        });

    //create custom control container
    var upload = $('<div class="customfile"></div>');

    // ##1 ++
    upload.css({
        width: opts.width
    });

    //create custom control button
    // ##2
    var uploadButton = $('<span class="customfile-button" aria-hidden="true"></span>').html(opts.buttonText).appendTo(upload);
    //create custom control feedback
    // ##2
    var uploadFeedback = $('<span class="customfile-feedback" aria-hidden="true"></span>').html(opts.inputText).appendTo(upload);

    // ##3
    if (opts.maxFileSize > 0 && $('input[type="hidden"][name="MAX_FILE_SIZE"]').length == 0) {
        $('<input type="hidden" name="MAX_FILE_SIZE">').val(opts.maxFileSize).appendTo(upload);
    }


    // ##4 ++
    var autoTruncateFileName = function () {
        //get file name
        var fileName = fileInput.val() || opts.inputText;

        if (fileName.length) {
            var limit = 0, // ensuring we're not going into an infinite loop
                trimmedFileName = fileName;
            uploadFeedback
                .text(fileName)
                .css({ display: 'inline' });
            while (limit < 1024 && trimmedFileName.length > 0 && uploadButton.outerWidth() + uploadFeedback.outerWidth() + 5 >= uploadButton.parent().innerWidth()) {
                trimmedFileName = trimmedFileName.substr(0, trimmedFileName.length - 1);
                uploadFeedback.text(trimmedFileName + '...');
                limit++;
            }
            uploadFeedback.css({ display: 'block' }); // ##4
        }
    };

    //match disabled state
    if(fileInput.is('[disabled]')){
        fileInput.trigger('disable');
    }

    uploadFeedback.data('text', opts.inputText);

    // ##5 ++
    if (! opts.showInputText ) {
        uploadFeedback.hide();
        uploadButton
            .css({
                float: 'inherit',
                display: 'block' // take up the full width of the parent container
            })
            .parent()
            .css({
                padding: 0
            });
    } else {
        uploadFeedback.css({
            display: 'block'
        });

        $(window).bind('resize', autoTruncateFileName);

    }


    //on mousemove, keep file input under the cursor to steal click
    upload
        .mousemove(function(e){
            fileInput.css({
                'left': e.pageX - upload.offset().left - fileInput.outerWidth() + 20, //position right side 20px right of cursor X)
                'top': e.pageY - upload.offset().top - $(window).scrollTop() - 3
            });    
        })
        .insertAfter(fileInput); //insert after the input
    
    fileInput.appendTo(upload);
        
    //return jQuery
    return $(this);
};








/**
 * ----------------------------------------------------------
 * EXAMPLE
 */
$(function(){

    // default
        $('#file_A').customFileInput();

    // percentage width
        $('#img').customFileInput({
            width: '50%'
        });

    // Custom Text
        $('#file_C').customFileInput({
            width: '30%',
            buttonText: 'Select File',
            changeText: 'Change File',
            inputText: 'Please select a file'
        });

    // Very short field (to test auto-truncated file name)
        $('#file_D').customFileInput({
            width: 150,
            inputText: ''
        });

    // button only
        $('#file_E').customFileInput({
            width: 90,
            buttonText: 'Upload File',
            changeText: 'Change',
            inputText: '',
            showInputText: false
        });

    // Event Handlers
        $('#file_F').customFileInput({
            width: 250,
            onChange: function () {
                console.info(arguments);
            }
        });

});