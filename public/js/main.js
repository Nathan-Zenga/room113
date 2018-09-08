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

		try {
			if (window.innerWidth >= 768 && window.pageYOffset > $("nav").offset().top) {
				$(".inner-nav").css({
					position: "fixed",
					top: "0",
					left: "0",
					padding: $("nav").css("padding"),
					width: $("nav").css("width")
				});
			} else {
				$(".inner-nav").css({position: "", top: "", left: "", padding: "", width: ""});
			}
		} catch(err) {
			console.log(err.message)
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

	$(".header-menu-icon").click(function() {
		$(this).children().toggle();
		$("nav").stop().slideToggle(200, function(){
			if ($(this).css("display") == 'none') $(this).css("display", "")
		});
	});

	$("#newpost > .submit").click(function(e) {
		e.preventDefault();
		var data = {};

		$("#newpost .details").each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.post('/library/admin/blog/post/submit', data, function(r,s) {
			$(":file").val() ? $("#uploader .submit").click() : location.pathname = r;
		});
	});

	$(".delete-post").click(function(){
		var post = $(this).parent();
		var id = {id: post.data('id')};
		$.post('/library/admin/blog/post/delete', id, function(r,s) {
			post.slideUp();
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
			$(":file").val() ? $("#uploader .submit").click() : location.pathname = r;
		});
	});

	toggleOnScroll();

	$(window).scroll(toggleOnScroll);

	$(":file").val("").each(function(){
		var txt = $(this).parent().find("span").text();
		$(this).parent().find("span").text(txt);
		$(":text").text('');
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
		var txt = $(this).parent().find("span").text();

		if( $(this).val() ) {
			$(".btn").css({height: "3em"});
			$(this).parent().find("span").text("");
		} else {
			$(".btn").css({height: ""});
			$(this).parent().find("span").text(txt);
		}

		if( text_input.length ) {
			text_input.val(log);
		} else {
			if( log ) alert(log);
		}
	});
});