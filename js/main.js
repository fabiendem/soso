$(document).ready(function() {
    $('#image-grid').each(function() { // the containers for all your galleries
        $(this).magnificPopup({
            delegate: '.filtered a', // the selector for gallery item
            type: 'image',
            gallery: {
                enabled:true
            },
            retina: {
                ratio: 2
            },
            removalDelay: 500,
            callbacks: {
                beforeOpen: function() {
                    var self = this;
                    // just a hack that adds mfp-anim class to markup 
                    self.st.image.markup = self.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                    self.st.mainClass = self.st.el.attr('data-effect');
                }
            }
        });
    });

    var updateHash = function(newHash) {
        if(history.pushState) {
            history.pushState(null, null, newHash);
        }
        else {
            location.hash = newHash;
        }
    };

    var highlightMenuItem = function($menuItem) {
        $('#menu-items li').removeClass('pure-menu-selected');
        $($menuItem).addClass('pure-menu-selected');
    };

    // Menu classes when clicked
    $('#menu-items li').click(function () {
        // Set the class on the clicked item and remove on the others
        var $this = $(this);
        highlightMenuItem($this);
        
        // Update Hash in the url
        var id = $this.attr('id');
        var newHash = '#' + id.substr('menu-item-'.length, id.length);
        updateHash(newHash);
    });


    // When loading from a hash, highlight the corresponding one
    var currentHash = window.location.hash;
    if(currentHash !== '') {
        currentHash = currentHash.substr(1, currentHash.length);
        highlightMenuItem($('#menu-item-' + currentHash));
    }

    // Apply local smooth scrolling
    $('nav').localScroll({
        duration: 600
    });

    _now = Date.now || function() {
        return new Date().getTime();
    };

    _throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
            previous = options.leading === false ? 0 : _now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            var now = _now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    var vendorTransforms = [
        '',
        '-webkit-',
        '-moz-',
        '-ms-',
        '-o-'
    ];

    var _scale = function($element, ratio) {
        $.each(vendorTransforms, function(index, vendor) {
            $element.css(vendor + 'transform', 'scale3d(' + ratio + ', ' + ratio + ', 1)');
        });
    };

    var _translateX = function($element, n) {
        $.each(vendorTransforms, function(index, vendor) {
            $element.css(vendor + 'transform', 'translate3d(' + n + ', 0, 0)');
        });
    };

    var _translateY = function($element, n) {
        $.each(vendorTransforms, function(index, vendor) {
            $element.css(vendor + 'transform', 'translate3d(0, ' + n + ', 0)');
        });
    };

    var $doodleImage = $('#doodle-image');
    var doodleHeight = $('#doodle').height();
    var $stickyHeader = $('#sticky-header');
    var $cloudLeft = $('#cloud-left');
    var $cloudRight = $('#cloud-right');
    var initialHorizontalPosition = 19; // %
    var scrollTopBody;
    var ratioDoodleScroll;
    var percentDoodleScroll;
    var positionCloud;
    var positionStickyHeader;
    var scaleDoodle;
    var applyParallax = function(scrollTopBody) {
        ratioDoodleScroll = 1 + (scrollTopBody - doodleHeight) / doodleHeight;
        // Round with 4 decimals
        ratioDoodleScroll = +ratioDoodleScroll.toFixed(4);

        percentDoodleScroll = ratioDoodleScroll * 100;

        // Move the clouds
        _translateX($cloudLeft, -percentDoodleScroll + '%');
        _translateX($cloudRight, percentDoodleScroll + '%');

        // Scale down the doodle
        scaleDoodle = 1 - ratioDoodleScroll;
        scaleDoodle = scaleDoodle < 0 ? 0 : scaleDoodle;
        scaleDoodle = scaleDoodle > 1 ? 1 : scaleDoodle;
        _scale($doodleImage, scaleDoodle);

        // Dropdown the filters
        positionStickyHeader = percentDoodleScroll;
        positionStickyHeader = positionStickyHeader > 100 ? 100 : positionStickyHeader;
        _translateY($stickyHeader, positionStickyHeader + '%');
    };

    var $body = $('body');
    var isScrolling = false;
    var AnimationFrame = window.AnimationFrame;
    AnimationFrame.shim();
    $(window).scroll(_throttle(function () {
        isScrolling = true;
        scrollTopBody = $body.scrollTop();
        refreshOnScroll(scrollTopBody);
    }, 60));

    var refreshOnScroll = function(scrollTopBody) {
        if(isScrolling) {
            applyParallax(scrollTopBody);
            AnimationFrame(function() {
                refreshOnScroll(scrollTopBody);
            });
            isScrolling = false;
        }
    };

    var $imageGrid = $('#image-grid');
    $imageGrid.shuffle({
        itemSelector: '.image-block'
    });

    var $filterOptions = $('.filter-options');
    // Set up button clicks
    var setupFilters = function() {
        var $btns = $filterOptions.children();
        $btns.on('click', function() {
            var $this = $(this),
            isActive = $this.hasClass('active'),
            group = isActive ? 'all' : $this.data('group');

            // Hide current label, show current label in title
            if (! isActive) {
                $('.filter-options .active').removeClass('active');
            }

            $this.toggleClass('active');

            // Filter elements
            $imageGrid.shuffle( 'shuffle', group );
        });
        $btns = null;
    };

    setupFilters();
});