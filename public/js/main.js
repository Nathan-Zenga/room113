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

	// $(".index").css("background-color", randomColour());

	// $(".col").each(function() {
	// 	$(this).css("background-color", randomColour());
	// });

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
		var deviceType = detect.parse(navigator.userAgent).device.type;
		var cond = window.innerWidth >= 768 && /Desktop|Tablet/.test(deviceType);
		var elm = cond ? ".global-nav" : "nav";
		$(this).children().toggle();
		$(elm).stop().slideToggle(200, function(){
			if ($(this).css("display") == 'none') $(this).css("display", "")
		});
	});

	$("#newpost > .submit").click(function(e) {
		var result = $("#newpost .result");
		e.preventDefault();
		result.text("Submitting...");
		var data = {};

		$("#libraryPostInfo .details").each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		if (!$("#title").val() && !$("#textbody").val()) {
			result
			.text("At least fill in a title or post message.")
			.delay(5000)
			.fadeOut(function(){
				$(this).text("").css("display", "");
			});
		} else {
			$.post('/admin/library/post/submit', data, function(msg,s) {
				if ($("#newpost :file").val()) {
					$("#newpost .uploader .submit").click();
				} else {
					result.text(msg).delay(5000).fadeOut(function(){
						$(this).text("").css("display", "");
					});
				}
			});
		}
	});

	$("#newpost .uploader .submit").click(function(e){
		e.preventDefault();

		var result = $("#newpost .result");
		var form = $('#newpost .uploader')[0];
		var data = new FormData(form);

		result.text("Uploading media");
		var txt = result.text();

		var interval = setInterval(function() {
			if (result.text().includes(" . . .")) {
				result.text(txt);
			} else {
				result.text(result.text() + " .");
			}
		}, 700);

		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: '/admin/library/post/media/upload',
			data: data,
			processData: false,
			contentType: false,
			cache: false,
			timeout: 600000,
			success: function (msg) {
				clearInterval(interval);
				result.text(msg).delay(5000).fadeOut(function(){
					$(this).text("").css("display", "");
				});
			},
			error: function (err) {
				console.log(err); result.text(err);
			}
		});
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
		var c = confirm("Sure you wanna delete?");
		if (c) {
			var p = $(this).closest(".post");
			var id = {id: p.attr('id')};
			$.post('/admin/library/post/delete', id, function(r,s) {
				p.slideUp();
			});
		}
	});


	$("#sotw > .submit").click(function(e) {
		e.preventDefault();
		var data = {};

		$("#songInfo .details").each(function() {
			var key = $(this).attr('name');
			data[key] = $(this).val();
		});

		$.post('/admin/studio/post/submit', data, function(msg,s) {
			if ($("#sotw :file").val()) {
				$("#sotw .uploader .submit").click()
			} else {
				$("#sotw .result").text(msg).delay(5000).fadeOut(function(){
					$(this).text("").css("display", "");
				});
			}

		});
	});

	$("#sotw .uploader .submit").click(function(e) {
		e.preventDefault();

		var result = $("#sotw .result");
		var form = $('#sotw .uploader')[0];
		var data = new FormData(form);

		result.text("Uploading media");
		var txt = result.text();

		var interval = setInterval(function() {
			if (result.text().includes(" . . .")) {
				result.text(txt);
			} else {
				result.text(result.text() + " .");
			}
		}, 700);

		$.ajax({
			type: 'POST',
			enctype: 'multipart/form-data',
			url: '/admin/studio/media/upload',
			data: data,
			processData: false,
			contentType: false,
			cache: false,
			timeout: 600000,
			success: function (msg) {
				clearInterval(interval);
				result.text(msg).delay(5000).fadeOut(function(){
					$(this).text("").css("display", "");
				});
			},
			error: function (err) {
				console.log(err); result.text(err);
			}
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