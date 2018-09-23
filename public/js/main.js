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

		var pageNav = $("nav").not(".global-nav");

		if (pageNav.length) {
			if (window.innerWidth >= 768 && window.pageYOffset > pageNav.offset().top) {
				$(".inner-nav").css({
					position: "fixed",
					top: "0",
					left: "0",
					padding: pageNav.css("padding"),
					width: pageNav.css("width")
				});
			} else {
				$(".inner-nav").css({position: "", top: "", left: "", padding: "", width: ""});
			}
		}
	};

	$(".index").css("background-color", randomColour());

	$(".col").each(function() {
		$(this).css("background-color", randomColour());
	});

	$(".scrolldown").click(function(){
		$("html, body").animate({
			scrollTop: $(".index.menu").offset().top
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

	var deviceType = detect.parse(navigator.userAgent).device.type;
	var href = $(".global-nav .link a:first").attr("href");

	if (deviceType === 'Tablet') $(".logo a, .global-nav .link a:first").removeAttr("href");

	$(".logo").mouseover(function() {
		if (window.innerWidth >= 768 && /Desktop|Tablet/.test(deviceType)) {
			$(".global-nav").fadeIn(function() {
				if (deviceType === 'Tablet') $(".global-nav .link a:first").attr("href", href);
			});
		}
	});

	$(".global-nav").mouseleave(function() {
		if (window.innerWidth >= 768 && /Desktop|Tablet/.test(deviceType)) {
			$(".global-nav").fadeOut(function() {
				if (deviceType === 'Tablet') $(".global-nav .link a:first").removeAttr("href");
			});
		}
	});

	$("#newpost > .submit").click(function(e) {
		var result = $("#newpost .result");
		e.preventDefault();
		result.text("Submitting...");
		var data = {};
		var missing = [];

		$("#newpost .details").each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
			
			if (!$(this).val()) missing.push(key);
		});

		if (missing.includes("title") && missing.includes("textbody")) {
			result
			.text("At least fill in a title or post message.")
			.delay(5000)
			.fadeOut(function(){
				$(this).text("").css("display", "");
			});
		} else {
			$.post('/admin/library/post/submit', data, function(p,s) {
				if ($(":file").val()) {
					result.text("Uploading media...");
					$("#newpost .uploader .submit").click();
				} else {
					result.text("Done!").delay(5000).fadeOut(function(){
						$(this).text("").css("display", "");
					});
				}
			});
		}
	});

	$(".edit-post").click(function() {
		var form = $(this).closest(".post").find("form");
		$(".post form").not(form).slideUp(200);
		form.slideToggle(200);
	});

	$(".edit-form .submit").click(function(e) {
		e.preventDefault();
		var result = $(".edit-form .result");
		result.text("Submitting...");
		var data = {};

		data.id = $(this).closest(".post").get(0).id;

		$(this).closest(".edit-form").find(".details").each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.post('/admin/library/post/update', data, function(r,s) {
			result.text(r).delay(5000).fadeOut(function(){
				$(this).text("").css("display", "");
			});
		});
	});

	$(".delete-post").click(function(){
		var p = $(this).closest(".post");
		var id = {id: p.attr('id')};
		$.post('/admin/library/post/delete', id, function(r,s) {
			p.slideUp();
		});
	});


	$("#songInfo").parent().children(".submit").click(function(e) {
		e.preventDefault();
		var data = {};

		$("#songInfo .details").each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.post('/admin/studio/post/submit', data, function(p,s) {
			$(":file").val() ? $("#sotw .uploader .submit").click() : location.pathname = p;
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

		$(".btn").css("height", $(this).val() ? "3em" : "");
		$(this).parent().find("span").css("opacity", $(this).val() ? 0 : "");

		if( text_input.length ) {
			text_input.val(log);
		} else {
			if( log ) alert(log);
		}
	});
});