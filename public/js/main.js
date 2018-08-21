$(function() {
	var randomColour = () => {
		var arr = [];

		for (var i = 0; i < 3; i++) {
			arr.push(Math.round(Math.random() * 255));
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

	$("#newpost > .submit").click(function(e) {
		e.preventDefault();
		var data = {};

		$("#newpost .details").each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.post('/library/admin/blog/post/submit', data, function(r,s) {
			$(":file").val() ? $("#uploader .submit").click() : location.reload();
		});
	});

	$(".delete-post").click(function(){
		var post = $(this).parent();
		var id = {id: post.data('id')};
		$.post('/library/admin/blog/post/delete', id, function(r,s) {
			location.reload();
		});
	});


	$("#songInfo").parent().children(".submit").click(function(e) {
		e.preventDefault();
		var data = {};

		$("#songInfo .details").each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.post('/studio/admin/post/submit', data, function(r,s) {
			$(":file").val() ? $("#songUploader .submit").click() : location.pathname = r;
		});
	});

	toggleOnScroll();

	$(window).scroll(function() {
		toggleOnScroll()
	});

	// Attach the 'fileselect' event to all file inputs on the page
	$(document).on('change', ':file', function() {
		var input = $(this);
		var numFiles = input.get(0).files ? input.get(0).files.length : 1;
		var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
		input.trigger('fileselect', [numFiles, label]);
	});

	// Watch for custom 'fileselect' event
	$(':file').on('fileselect', function(event, numFiles, label) {
		var text_input = $(this).parents('.input-group').find(':text');
		var log = numFiles > 1 ? numFiles + ' files selected' : label;

		if( $(":file").val() ) {
			$(".btn").css({width: "210px", height: "3em"});
			$(".btn span").text("");
		} else {
			$(".btn").css({width: "", height: ""});
			$(".btn span").text("or click here to upload");
		}

		if( text_input.length ) {
			text_input.val(log);
		} else {
			if( log ) alert(log);
		}
	});
});