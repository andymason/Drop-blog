/*
    Title:  Drop Blog
*/
var dropBlog = (function(){
    var storyContainer = $('#story');
    var searchBtn = $('#search_button');
    var searchBox = $('#search_box');
    var previewContainer = $('#preview');
    var addMediaBtn = $('#add_media');
    var addTextBtn = $('#add_text');
    var currentMedia = {};
    var story = {'elements':[]};
    var previewObj = {};
    var jsonElm = $('#json_output');
    var EMEDLY_URI = 'http://api.embed.ly/1/oembed';

    function mediaSearch() {
        var searchString = searchBox.val();
        console.log(searchString);
        // Check something has been entered in to the search box
        if (typeof searchString !== 'string' || searchString.length <= 0) {
            previewContainer.html('<p>Please enter something into the search bar.</p>');
            return;
        }

        previewContainer.html('<p>Searching...</p>');

        $.ajax({
            url: EMEDLY_URI,
            dataType: 'json',
            data: {
                key: 'ff71ab58232f11e1a6ba4040d3dc5c07',
                width: '360',
                nostyle: 'true',
                url: searchString,
                format: 'json'
            },
            success: previewMedia,
            error: function(e) {
                console.log('Error with embedly ajax call');
                console.log(e)
            }
        });
    }

    function previewMedia(data) {
        previewObj = data;
        previewElm = buildElement(data);
        previewContainer.empty();
        previewContainer.append(previewElm);
        addMediaBtn.removeAttr('disabled');
    }

    function addElement() {
        // add to JSON object
        story.elements.push(currentMedia);
        storyContainer.append(previewElm);
        updateStoryData();
        addMediaBtn.attr('disabled', 'disabled');
    }

    function updateStoryData() {
        story.elements = [];

        $.each($('.element'), function(key, value) {
            story.elements.push($(value).data('metadata'));
        });

        outputJSON();
    }

    function outputJSON() {
        var jsonString = JSON.stringify(story, null, 2);
        jsonElm.text(jsonString);
    }

    function buildElement(elmData) {
        var elm = $('<div class="element" />');
        var controls = $('<div class="controls" />');
        var info = $('<p class="type_info" />');
        var dragger = $('<p class="dragger">Drag me</p>');
        var deleteElm = $('<p class="delete">Delete</p>');

        info.text(elmData.type);
        elm.addClass(elmData.type);
        controls.append(info);
        controls.append(deleteElm);
        controls.append(dragger);
        elm.append(controls);
        
        switch (elmData.type) {
            case 'video':
            case 'rich':
            case 'text':
                var html = $(elmData.html);
                if (elmData.type === 'text') {
                    html.attr('contenteditable', 'true');
                }
                elm.append(html);
                break;
            case 'photo':
                 var img = $('<img/>', {
                    src: elmData.url,
                    alt: elmData.title,
                    width: 440
                });
                elm.append(img);
                break;
        }

        elm.data('metadata', elmData);
        return elm;
    }

    function addTextBlock(){
        var textObj = {
            type: 'text',
            html: '<div>Write something here.</div>'
        };
        var elm = buildElement(textObj);

        story.elements.push(textObj);
        storyContainer.append(elm);

        updateStoryData();
    }

    function buildStory(storyObj) {
        storyContainer.empty();
        $.each(storyObj.elements, function(index, value) {
            storyContainer.append(buildElement(value));
        });
        story = storyObj;
    }

    function saveTextMetadata() {
        var metadata = $(this).parent('.element').data('metadata');
        metadata.html = $(this).html();
        updateStoryData();
    }

    function deleteElement() {
        $(this).parents('.element').remove();
        updateStoryData();
    }

    function pasteText(e) {
        /*
            // TODO: Need to paste where user's caret  is

            var selection = window.getSelection();
            var range = selection.getRangeAt(0)
        */
        e.preventDefault();
        var text = e.originalEvent.clipboardData.getData('text');
        $(this).html($(this).html() + text);
    }

    function init() {
        // Click events
        searchBox.bind('keydown', function(e) {
            if (e.keyCode && e.keyCode === 13) {
                 mediaSearch();
            } 
        });
        searchBtn.bind('click',  mediaSearch);
        addMediaBtn.bind('click', addElement);
        addTextBtn.bind('click', addTextBlock);
        
        // On finishing text edit
        storyContainer.on('blur','div[contenteditable="true"]', saveTextMetadata);
        storyContainer.on('paste','div[contenteditable="true"]', pasteText);
        storyContainer.on('click','.delete', deleteElement);

        $('#search_area').on('click','.delete', function() {
            $(this).parents('.element').remove();
            addMediaBtn.attr('disabled', 'disabled');
        });

        buildStory(sampleJSON);
        outputJSON();

        $( "#story" ).sortable({
            handle: '.dragger',
            deactivate: updateStoryData
        });


        // Demo examples
        $('.example').bind('click', function() {
            var link = $(this).attr('href');
            searchBox.val(link);
            mediaSearch();
        });


    }

    return {
        init: init
       
    }
}());


var sampleJSON = {
    "elements":[
        {
            "type":"text",
            "html":"<div>Hello <b>world!</b> How are you <i>enjoying</i> this text block?</div>"
        },
        {
            "provider_url":"http://www.youtube.com/",
            "description":"Homer finding the ad for a free trampoline.",
            "title":"Homer Trampoline",
            "url":"http://www.youtube.com/watch?v=Zh5knx1Bt64",
            "author_name":"BrandonBarley",
            "height":202,
            "width":360,
            "html":"<iframe width=\"360\" height=\"202\" src=\"http://www.youtube.com/embed/Zh5knx1Bt64?fs=1&feature=oembed\" frameborder=\"0\" allowfullscreen></iframe>",
            "thumbnail_width":480,
            "version":"1.0",
            "provider_name":"YouTube",
            "thumbnail_url":"http://i3.ytimg.com/vi/Zh5knx1Bt64/hqdefault.jpg",
            "type":"video",
            "thumbnail_height":360,
            "author_url":"http://www.youtube.com/user/BrandonBarley"
        },
        {
            "provider_url":"http://twitter.com",
            "description":"Preparing to push the button...",
            "title":"Trent Reznor's Twitter",
            "author_name":"Trent Reznor",
            "html":"<div><div><div class=\"components-middle\"><p><span class=\"metadata\"><span class=\"author\"><a href=\"http://twitter.com/trent_reznor\"><img src=\"http://a2.twimg.com/profile_images/58499973/robo1_normal.jpg\"></a><strong><a href=\"http://twitter.com/trent_reznor\">@trent_reznor</a></strong><br>Trent Reznor</span></span>\nPreparing to push the button...<br><span><a title=\"Fri Dec 02 00:18:27 +0000 2011\" href=\"http://twitter.com/trent_reznor/status/142397178881638400\">Dec 02</a> via web</span><span class=\"tweet-actions\"><a href=\"https://twitter.com/intent/favorite?tweet_id=142397178881638400\" class=\"favorite-action\" title=\"Favorite\"><span><i></i><b>Favorite</b></span></a><a href=\"https://twitter.com/intent/retweet?tweet_id=142397178881638400\" class=\"retweet-action\" title=\"Retweet\"><span><i></i><b>Retweet</b></span></a><a href=\"https://twitter.com/intent/tweet?in_reply_to=142397178881638400\" class=\"reply-action\" title=\"Reply\"><span><i></i><b>Reply</b></span></a></span></p></div></div></div>",
            "author_url":"http://twitter.com/trent_reznor",
            "version":"1.0",
            "provider_name":"Twitter",
            "thumbnail_url":"http://a2.twimg.com/profile_images/58499973/robo1_normal.jpg",
            "type":"rich"
        }
    ]
};


$(document).ready(dropBlog.init);
