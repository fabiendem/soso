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
			}
		});
	});

	// Menu classes when selected
	$('#menu-items li').click(function () {
		var $this = $(this);
		$('#menu-items li').removeClass('pure-menu-selected');
		$this.addClass('pure-menu-selected');
	});
});
