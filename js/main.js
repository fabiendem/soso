$(document).ready(function() {
    $('.image-grid').each(function() { // the containers for all your galleries
        $(this).magnificPopup({
            delegate: 'a', // the selector for gallery item
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
            isActive = $this.hasClass( 'active' ),
            group = isActive ? 'all' : $this.data('group');

            // Hide current label, show current label in title
            if ( !isActive ) {
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