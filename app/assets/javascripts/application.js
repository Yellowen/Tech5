//= require ./lib/jquery
//= require_tree ./lib
//= require_tree ./semantic
//= require_self
//= require admin
var author = {en: "Voices", fa: "صداها"};
var _links = {en: 'Links', fa: 'لینک ها'};

var auto_rotate = true;
var last_time = 0;

var details, lang, time_cache, timed_content;


function show_error(id) {
    $("#subscribe").find('span').transition('remove looping');
    $(id).fadeIn().delay(4000).fadeOut();
}


function show_msg(id) {
    $("#subscribe").find('span').transition('remove looping');
    $("#subscribe").hide();
    $("#email").hide();
    $(id).fadeIn();
}

function show_content_for(id) {
    if (auto_rotate === true) {
        $('.descriptions').hide();
        $("#desc_" + id).fadeIn();
        $("#episode_menu .item").removeClass('active');
        $("#topic_" + id).addClass('active');
    }
}


function prepare_details(){
    if ((JSON_DETAILS !== "")|| (JSON_DETAILS !== undefined)) {
        details = JSON_DETAILS;//JSON.parse(json_data);
        lang = $("html").attr('lang');
        time_cache = [];
        timed_content = {};
        if (!_.isEmpty(details)) {

            var topics = details.topics.reverse();
            $.each(topics, function(x){
                var obj = details.topics[x];
                var desc =  details.sections[obj.id.toString()].desc[lang];
                $("#episode_menu").prepend("<a class='topic item' id='topic_" + obj.id + "' data-id='" + obj.id + "'>" + obj[lang] + "</a>");
                time_cache.push(parseInt(obj.time));
                timed_content["id_" + parseInt(obj.time).toString()] = obj.id;

                // Inject links
                var links = "<br /><br /><span class='links'>" + _links[lang] + ":</span><div class='ui divided horizontal list'>";
                _.each(_.keys(details.sections[obj.id.toString()].links), function(link){
                    links += "<div class='item'><a href='" + details.sections[obj.id.toString()].links[link] + "'>" + link + "</a></div>";
                });
                links += "</div>";
                $("#desc").append('<div class="descriptions" style="display:none;" id="desc_' + obj.id + '">' + desc + links + '</div>');
            });
        }

        if (details.authors != undefined) {
            $("#episode_menu").prepend("<a class='topic active purple item' id='topic_author' data-id='author'>" + author[lang] + "</a>");

            var authors = "<div class='ui very relaxed huge divided list'>";
            _.forEach(details.authors, function(x){
                authors += "<div class='item'><img class='ui avatar image' src='" + x.avatar_link + "'><div class='content'><div class='header'>" + x.name + "</div>";
                _.each(_.keys(x.links), function(key){
                    authors += "<a href='" + x.links[key] + "'>" + key + "</a> ";
                });
                authors += "</div></div>";
            });
            authors += "</div>";
            $("#desc").prepend('<div dir="ltr" style="direction: ltr; text-align: left;" class="descriptions" id="desc_author">' + authors + '</div>');
        }
    }

}

$(function(){
    $(".ui.message").on('click', function(event){
        $(this).fadeOut();
    });

    $('.audioplayer').mediaelementplayer({
        success: function (mediaElement, domObject) {

            // add event listener
            mediaElement.addEventListener('timeupdate', function(e) {
                var ctime = parseInt(mediaElement.currentTime);
                if (_.indexOf(time_cache, ctime) != -1) {
                    if (last_time != ctime) {
                        var topic_id = timed_content["id_"+ ctime.toString()];
                        show_content_for(topic_id);
                    }

                }
                last_time = ctime;
            }, false);
        }
    });


    $(".ui.dropdown").dropdown();
    //$(".ui.computer.sidebar").sidebar('attach events', '.toggle.button.computer');
    $(".ui.sidebar").sidebar({overlay: true}).sidebar('attach events', '.toggle.button');

    $('[data-modal]').on('click', function(){
        $($(this).data('modal')).modal('show');
    });


    $("#upload_file").on('click', function(event){
        $("#actual_field").click();
    });

    $('.topic').on('click', function(){
        auto_rotate = true;
        show_content_for($(this).data('id'));
        $("#auto_rotate").fadeIn();
        auto_rotate = false;
    });

    $("#auto_rotate").on('click', function(){
        auto_rotate = true;
        $(this).fadeOut();
    });

    $(".langitem").on('click', function(){
        $("#titlelang").html($(this).html());
        $("input[name=locale]").val($(this).html());
    });

    $("#subscribe").on('click', function(event){
        var email = $('#email').val();
        $(this).find('span')
            .transition('set looping')
            .transition('pulse');
        $('#email').addClass('disabled');
        var that = this;
        $.ajax({url: '/subscribe',
                type: 'POST',
                data: {email: email}})
            .done(function(data){
                $('#email').removeClass('disabled');
                if(data.status == '0') {
                    show_msg("#suc");
                }
                else if (data.status == '1') {
                    show_error("#already");
                }
                else if (data.status == '2') {
                    show_error("#not_valid");
                }
                else {
                    show_error("#failed");
                }

            })
            .fail(function(data){
                $(that).removeClass('loading');
                $('#email').removeClass('disabled');

            });


    });


    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    $('.email').html('info@radioboot.com');
});
