$(document).ready(function() {

    //  Hero carousel
    $('#proofPhotos').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        dots: true,
        arrows: true,
        infinite: true,
        speed: 500,
        fade: true,
        cssEase: 'linear'
    });

    $('#recos').slick({
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: false,
        autoplay: true, 
        arrows: false
    });

    // // Settings for Owl carousel on user recos
    // var recos = $("#recos");
    // if( recos && recos.length ) {
    //     $("#recos").owlCarousel({
    //         items : 2.5,
    //         navigation: false,
    //         stopOnHover: true,
    //         paginationSpeed: 1000,
    //         autoPlay: 3000,
    //         loop: true
    //     });
    // }

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