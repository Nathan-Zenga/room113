$(function() {
	var randomColour = () => {
		var arr = [];

		for (var i = 0; i < 3; i++) {
			arr.push(Math.floor(Math.random() * 255));
		}

		arr = "rgb(" + arr.join(",") + ")";
		return arr;
	};

	var toggleOnScroll = () => {
		if (window.pageYOffset > 50) {
			$("#toTop").fadeIn()
		} else {
			$("#toTop").fadeOut()
		}
	};

	$(".index").css("background-color", randomColour());

	$(".col").each(function() {
		$(this).css("background-color", randomColour());
	});

	$(".scrolldown").click(function(){
		$("html, body").animate({
			scrollTop: window.innerHeight
		}, 500, "easeInOutExpo")
	});

	$("#toTop").click(function(){
		$("html, body").animate({
			scrollTop: 0
		}, 500, "easeInOutExpo")
	});

	toggleOnScroll();

	$(window).scroll(function(){
		toggleOnScroll()
	});

	// We can attach the `fileselect` event to all file inputs on the page
	$(document).on('change', ':file', function() {
		var input = $(this);
		var numFiles = input.get(0).files ? input.get(0).files.length : 1;
		var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});

	// We can watch for our custom `fileselect` event like this
	$(':file').on('fileselect', function(event, numFiles, label) {
		var input = $(this).parents('.input-group').find(':text');
		var log = numFiles > 1 ? numFiles + ' files selected' : label;

		if( input.length ) {
			input.val(log);
		} else {
			if( log ) alert(log);
		}
	});

	$("#newpost > .submit").click(function(e) {
		e.preventDefault();

		var $details = $("#newpost .details");
		var data = {};

		$details.each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.post('/admin/blog/post/submit', data, function(r,s) {
			$(":file").val() ? $("#uploader .submit").click() : location.pathname = r;
		});
	});

	$(".delete-post").click(function(){
		var id = {id: $(this).parent().data('id')};
		$.post('/admin/blog/post/delete', id, function(r,s) {
			location.pathname = r;
		});
	})
});