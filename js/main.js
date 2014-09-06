$(document).ready(function() {
	// grab an element
	var header = document.querySelector('header');
	// construct an instance of Headroom, passing the element
	var headroom  = new Headroom(header);
	// initialise
	//headroom.init();

	$('.image-grid').each(function() { // the containers for all your galleries
		$(this).magnificPopup({
			delegate: 'a', // the selector for gallery item
			type: 'image',
			gallery: {
				enabled:true
			},
			retina: {
				ratio: 1
			}
		});
	});

	// Menu
	$('#menu-items li').click(function () {
		$('#menu-items li').removeClass('pure-menu-selected');
		$(this).addClass('pure-menu-selected');
		$(header).removeClass('headroom--unpinned');
	});
});
