$(document).ready(function() {

    $.fn.scrollStopped = function(callback) {
        var $this = $(this), 
            self = this;
        $this.scroll(function(){
            if ($this.data('scrollTimeout')) {
              clearTimeout($this.data('scrollTimeout'));
            }
            $this.data('scrollTimeout', setTimeout(callback, 250, self));
        });
    };

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

    var vendorPrefixes = [
        '-webkit-',
        '-moz-',
        '-ms-',
        '-o-',
        ''
    ];

    var _scale = function($element, ratio) {
        $.each(vendorPrefixes, function(index, vendor) {
            $element.css(vendor + 'transform', 'scale3d(' + ratio + ', ' + ratio + ', 1)');
        });
    };

    var _translateX = function($element, n) {
        $.each(vendorPrefixes, function(index, vendor) {
            $element.css(vendor + 'transform', 'translate3d(' + n + ', 0, 0)');
        });
    };

    var _translateY = function($element, n) {
        $.each(vendorPrefixes, function(index, vendor) {
            $element.css(vendor + 'transform', 'translate3d(0, ' + n + ', 0)');
        });
    };

    var _translateXAndScale = function ($element, translateX, scale) {
        $.each(vendorPrefixes, function(index, vendor) {
            $element.css(vendor + 'transform', 'translateX(' + translateX + ') scale3d(' + scale + ', ' + scale + ', 1)');
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

    FastClick.attach(document.body);

    var $imageGrid = $('#image-grid');
    var $allCategories = $('.all-categories');
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

    var $nav = $('nav');
    // Apply local smooth scrolling
    $nav.localScroll({
        duration: 600
    });

    var $window = $(window);
    var isScrolling = false;
    var AnimationFrame = window.AnimationFrame;
    AnimationFrame.shim();
    var scrollTopWindow;
    var documentHeight = $(document).height();
    var $about = $('#about-me');
    var $stickyHeader = $('#sticky-header');
    var $doodle = $('#doodle');
    var $doodleImage = $('#doodle-image');
    var doodleHeight = $doodle.height();
    var $cloudLeft = $('#cloud-left');
    var $cloudRight = $('#cloud-right');
    var initialHorizontalPosition = 19; // %
    var percentDoodleScrolled;
    var positionCloud;
    var scaleScroll;
    var windowHeight = $(window).height();
    var bottomScroll = documentHeight - windowHeight;

    var _refreshOnScroll = function(scrollTopWindow) {
        if(isScrolling) {
            var ratioDoodleScrolled = 1 + (scrollTopWindow - doodleHeight) / doodleHeight;
            // Round with 4 decimals
            ratioDoodleScrolled = +ratioDoodleScrolled.toFixed(4);
            
            // Parallax in the doodle
            _applyParallaxDoodle(ratioDoodleScrolled);
            
            // Sticky header
            if($stickyHeader.length > 0 &&
                $about.length > 0) {
                var headerHeight = $nav.height() + $stickyHeader.height();
                var aboutOffsetTop = $about.offset().top;
                var imageGridOffsetTop = $imageGrid.offset().top;
                // If we are over the about section
                if(scrollTopWindow + headerHeight  > aboutOffsetTop) {
                    if($stickyHeader.hasClass('no-transition')) {
                        $stickyHeader.removeClass('no-transition');
                    }
                    if(! $stickyHeader.hasClass('hidden')) {
                        $stickyHeader.addClass('hidden');
                    }
                }
                else { // Above the about section
                    // Make sure the header is not hidden
                    if($stickyHeader.hasClass('hidden')) {
                        $stickyHeader.removeClass('hidden');
                    }
                    // Scrolling up, if over the doodle
                    if(scrollTopWindow + headerHeight < imageGridOffsetTop) {
                        // Disable transition, as it is based on the scrolling ratio
                        if(! $stickyHeader.hasClass('no-transition')) {
                            $stickyHeader.addClass('no-transition');
                        }
                    }
                    _revealStickyHeader(ratioDoodleScrolled);
                }
            }
            
            // Animate collibri and speaker
            _animateOnScroll(scrollTopWindow);

            AnimationFrame(function() {
                _refreshOnScroll(scrollTopWindow);
            });
            isScrolling = false;
        }
    };

    var _applyParallaxDoodle = function(ratioDoodleScrolled) {
        if(ratioDoodleScrolled > 1) {
            return;
        }

        // Scale down the doodle
        var scaleScroll = 1 - ratioDoodleScrolled;
        scaleScroll = scaleScroll < 0 ? 0 : scaleScroll;
        _scale($doodleImage, scaleScroll);

        // Move the clouds and scale down the clouds
        _translateXAndScale($cloudLeft, -ratioDoodleScrolled * 100 + '%', scaleScroll);
        _translateXAndScale($cloudRight, ratioDoodleScrolled * 100 + '%', scaleScroll);
    };

    var _revealStickyHeader = function(ratioDoodleScrolled) {
        if(ratioDoodleScrolled < 0) {
            // Hide it because Safari shows it while the bounce of the scroll up...
            $stickyHeader.hide();
            return;
        }
        $stickyHeader.show();

        // Dropdown the filters
        var positionStickyHeader = ratioDoodleScrolled * 100;
        console.log(positionStickyHeader);
        positionStickyHeader = positionStickyHeader > 100 ? 100 : positionStickyHeader;
        _translateY($stickyHeader, positionStickyHeader + '%');
    };

    var $contactSpeaker = $('#contact-speaker');
    var $movingColibri = $('#moving-colibri');
    var spritesColibri = ['icon-colibri', 'icon-colibri-d', 'icon-colibri', 'icon-colibri-h'];
    var numberOfSprites = spritesColibri.length;
    var spriteNumber = 0;
    var _animateOnScroll = function(scrollTopWindow) {
        // Speaker
        if(scrollTopWindow >= bottomScroll) {
            $contactSpeaker.removeClass('icon-speaker-l').addClass('icon-speaker-s');
        }
        else {
            $contactSpeaker.removeClass('icon-speaker-s').addClass('icon-speaker-l');
        }

        // Colibri
        $movingColibri.removeClass('icon-colibri icon-colibri-d icon-colibri-h')
                      .addClass(spritesColibri[spriteNumber]);

        spriteNumber++;
        spriteNumber = spriteNumber >= numberOfSprites ? 0 : spriteNumber;
    };

    var _resetColibri = function() {
        $movingColibri.removeClass('icon-colibri icon-colibri-d icon-colibri-h')
                      .addClass('icon-colibri');
    };

    var $body = $('body');
    var _onScroll = function() {
        isScrolling = true;
        scrollTopWindow = $window.scrollTop();
        _refreshOnScroll(scrollTopWindow);
    };

    if (Modernizr.mq("screen and (min-width:523px)")) {
        // Firefox wants the window
        $window.scroll(_throttle(_onScroll, 60));
        _onScroll();

        $window.scrollStopped(function() {
            _resetColibri();
        });
    }

    var _initShuffle = function() {
        var $shuffleSizer = $('#shuffle_sizer');
        $imageGrid.shuffle({
            itemSelector: '.image-block',
            sizer: $shuffleSizer
        });
    };

    // Set up button clicks
    var $filterOptions = $('.filter-options');
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
                $this.addClass('active');
            }

            // Filter elements
            $imageGrid.shuffle('shuffle', newGroup);

            // Scroll up to portfolio
            $(window).scrollTo('#portfolio', {
                duration: 600
            });
        });
        $btns = null;
    };

    // Re layout shuffle when images load. This is only needed
    // below 768 pixels because the .picture-item height is auto and therefore
    // the height of the picture-item is dependent on the image
    // I recommend using imagesloaded to determine when an image is loaded
    // but that doesn't support IE7
    var _listen = function() {
        var debouncedLayout = _throttle(function() {
            $imageGrid.shuffle('update');
        }, 300);

        // Get all images inside shuffle
        $imageGrid.find('img').each(function() {
            var proxyImage;

            // Image already loaded
            if ( this.complete && this.naturalWidth !== undefined ) {
                return;
            }

            // If none of the checks above matched, simulate loading on detached element.
            proxyImage = new Image();
            $( proxyImage ).on('load', function() {
                $(this).off('load');
                debouncedLayout();
            });

            proxyImage.src = this.src;
        });

        // Because this method doesn't seem to be perfect.
        setTimeout(function() {
            debouncedLayout();
        }, 500);
    };

    var setupShuffle = function() {
        _initShuffle();
        _setupFilters();
        _listen();
    };
    setupShuffle();

    var _setupGallery = function() {       
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
                preload: [2,2],
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
    };
    _setupGallery();

    // When user hover contact section, change the speaker
    // Jank OK
    $('#contact').hover(function() {
        $contactSpeaker.removeClass('icon-speaker-l').addClass('icon-speaker-s');
    },
    function() {
        $contactSpeaker.removeClass('icon-speaker-s').addClass('icon-speaker-l');
    });
});