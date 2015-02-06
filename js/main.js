$(document).ready(function() {

    var $imageGrid = $('#image-grid');
    var $filterOptions = $('.filter-options');
    var $allCategories = $('#all-categories');

    var $window = $(window);
    var isScrolling = false;
    var AnimationFrame = window.AnimationFrame;
    AnimationFrame.shim();

    var vendorTransforms = [
        '-webkit-',
        '-moz-',
        '-ms-',
        '-o-',
        ''
    ];

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

    var _updateHash = function(newHash) {
        if(history.pushState) {
            history.pushState(null, null, newHash);
        }
        else {
            location.hash = newHash;
        }
    };

    var _highlightMenuItem = function($menuItem) {
        $('#menu-items li').removeClass('pure-menu-selected');
        $($menuItem).addClass('pure-menu-selected');
    };

    // Menu classes when clicked
    $('#menu-items li').click(function () {
        // Set the class on the clicked item and remove on the others
        var $this = $(this);
        _highlightMenuItem($this);
        
        // Update Hash in the url
        var id = $this.attr('id');
        var newHash = '#' + id.substr('menu-item-'.length, id.length);
        _updateHash(newHash);

        if(id === 'menu-item-portfolio') {
            $('.filter-options .active').removeClass('active');
            $allCategories.addClass('active');
            // Filter elements
            $imageGrid.shuffle('shuffle', 'all');
        }
    });

    // When loading from a hash, highlight the corresponding one
    var currentHash = window.location.hash;
    if(currentHash !== '') {
        currentHash = currentHash.substr(1, currentHash.length);
        _highlightMenuItem($('#menu-item-' + currentHash));
    }

    // Apply local smooth scrolling
    $('nav').localScroll({
        duration: 600
    });

    $imageGrid.each(function() { // the containers for all your galleries
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

    var scrollTopWindow;
    // Firefox wants the window
    $window.scroll(_throttle(function () {
        isScrolling = true;
        scrollTopWindow = $window.scrollTop();
        _refreshOnScroll(scrollTopWindow);
    }, 60));

    var _refreshOnScroll = function(scrollTopWindow) {
        if(isScrolling) {
            _applyParallax(scrollTopWindow);
            _animateOnScroll(scrollTopWindow);
            AnimationFrame(function() {
                _refreshOnScroll(scrollTopWindow);
            });
            isScrolling = false;
        }
    };

    var $doodleImage = $('#doodle-image');
    var doodleHeight = $('#doodle').height();
    var $stickyHeader = $('#sticky-header');
    var $cloudLeft = $('#cloud-left');
    var $cloudRight = $('#cloud-right');
    var initialHorizontalPosition = 19; // %
    var ratioDoodleScroll;
    var percentDoodleScroll;
    var positionCloud;
    var positionStickyHeader;
    var scaleDoodle;
    var windowHeight = $(window).height();
    var documentHeight = $(document).height();
    var bottomScroll = documentHeight - windowHeight;

    var _applyParallax = function(scrollTopWindow) {
        ratioDoodleScroll = 1 + (scrollTopWindow - doodleHeight) / doodleHeight;
        // Round with 4 decimals
        ratioDoodleScroll = +ratioDoodleScroll.toFixed(4);

        percentDoodleScroll = ratioDoodleScroll * 100;

        // Move the clouds
        _translateX($cloudLeft, -percentDoodleScroll + '%');
        _translateX($cloudRight, percentDoodleScroll + '%');

        // Scale down the doodle
        scaleDoodle = 1 - ratioDoodleScroll;
        scaleDoodle = scaleDoodle < 0 ? 0 : scaleDoodle;
        _scale($doodleImage, scaleDoodle);

        // Dropdown the filters
        positionStickyHeader = percentDoodleScroll;
        positionStickyHeader = positionStickyHeader > 100 ? 100 : positionStickyHeader;
        _translateY($stickyHeader, positionStickyHeader + '%');
    };

    var $contactSpeaker = $('#contact-speaker');
    var $movingColibri = $('#moving-colibri');
    var spritesColibri = ['icon-colibri', 'icon-colibri-d', 'icon-colibri', 'icon-colibri-h'];
    var numberOfSprites = spritesColibri.length;
    var spriteNumber = 0;
    var _animateOnScroll = function(scrollTopWindow) {
        if(scrollTopWindow >= bottomScroll) {
            $contactSpeaker.removeClass('icon-speaker-l').addClass('icon-speaker-s');
        }
        else {
            $contactSpeaker.removeClass('icon-speaker-s').addClass('icon-speaker-l');
        }
        $movingColibri.removeClass('icon-colibri icon-colibri-d icon-colibri-h').addClass(spritesColibri[spriteNumber]);
        spriteNumber++;
        spriteNumber = spriteNumber >= numberOfSprites ? 0 : spriteNumber;
    };

    $imageGrid.shuffle({
        itemSelector: '.image-block'
    });

    // Set up button clicks
    var _setupFilters = function() {
        var $btns = $filterOptions.children();
        $btns.on('click', function() {
            var $this = $(this),
            groupClicked = $this.data('group'),
            isAllButtonClicked = groupClicked === 'all',
            wasActive = $this.hasClass('active'),
            newGroup = 'all';

            if(! isAllButtonClicked) {
                newGroup = wasActive ? 'all' : $this.data('group');
                // Hide current label, show current label in title
                if (! wasActive) {
                    $('.filter-options .active').removeClass('active');
                }
                else {
                    $allCategories.addClass('active');
                }
                $this.toggleClass('active');
            }
            else {
                $('.filter-options .active').removeClass('active');
                $allCategories.addClass('active');
            }

            // Filter elements
            $imageGrid.shuffle('shuffle', newGroup);
        });
        $btns = null;
    };

    _setupFilters();
});