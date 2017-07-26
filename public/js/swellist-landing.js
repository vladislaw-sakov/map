$(document).ready(function() {

        //  Hero carousel
    $('.heroImage').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        dots: true,
        arrows: false,
        infinite: true,
        speed: 500,
        fade: true,
        cssEase: 'linear'
    });

    // STICKY NAV
    if ( $(window).width() > 800) {
        var header = $(".site-header");
        $(window).scroll(function() {
            var scroll = $(window).scrollTop();

            if (scroll >= 500) {
                header.removeClass('site-header').addClass("sticky-nav");
            } else {
                header.removeClass("sticky-nav").addClass('site-header');
            }
        });
    }
    else {
        var header = $(".site-header");
        $(window).scroll(function() {
            var scroll = $(window).scrollTop();

            if (scroll >= 1050) {
                header.removeClass('site-header').addClass("sticky-nav");
            } else {
                header.removeClass("sticky-nav").addClass('site-header');
            }
        });
    }

    // Settings for Owl carousel on user testimonials
    var testimonials = $("#testimonial");
    if( testimonials && testimonials.length ) {
        $("#testimonial").owlCarousel({
            items : 3,
            navigation: false,
            stopOnHover: true,
            paginationSpeed: 1000,
            autoPlay: 3000,
            loop: true
        });
    }

    // Settings for Owl carousel on user testimonials
    var mobile = $("#mobile-how");
    if( mobile && mobile.length ) {
        $("#mobile-how").owlCarousel({
            items : 3,
            navigation: false,
            stopOnHover: true,
            paginationSpeed: 1000,
            autoPlay: 3000,
            loop: true
        });
    }

    // Removes phone overlay in Scrollable Phone
    $( "#phonezone" ).mousemove(
        function() {
            $( this ).find( "div.phone-overlay" ).fadeOut( 1000 );
        }
    );


});

$(function() {
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
});