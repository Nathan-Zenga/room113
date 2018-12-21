var randomRGBA = (a) => {
	if (!a) a = 1;
	var arr = [];

	for (var i = 0; i < 3; i++) {
		arr.push(Math.round(Math.random() * 255));
	}

	arr = "rgba(" + arr.join(",") + "," + a + ")";
	return arr;
};

var uploader = (d) => {
	var result = $("#"+d.id+" .result");
	var form = $("#"+d.id+" .uploader")[0];
	var data = new FormData(form);

	result.text("Uploading media");
	var txt = result.text();

	var interval = setInterval(function() {
		if (result.text().includes(" . . .")) {
			result.text(txt);
		} else {
			result.stop().text(result.text() + " .");
		}
	}, 700);

	$.ajax({
		type: 'POST',
		enctype: 'multipart/form-data',
		url: d.postUrl,
		data: data,
		processData: false,
		contentType: false,
		cache: false,
		timeout: 600000,
		success: function (msg) {
			clearInterval(interval);
			result.stop().text(msg).delay(5000).fadeOut(function(){
				$(this).text(d.resultMsg || "").css("display", "");
			});
		},
		error: function (err) {
			console.log(err); result.text(err);
		}
	});
}

var toggleOnScroll = () => {
	if (window.pageYOffset > 50) {
		$("#toTop").fadeIn()
	} else {
		$("#toTop").fadeOut()
	}

	var pageNav = $("nav").not(".global-nav");

	if (pageNav.length) {
		if (window.innerWidth >= 768 && window.pageYOffset > pageNav.offset().top) {
			$(".inner-nav").addClass("fixed").css("width", pageNav.css("width"));
		} else {
			$(".inner-nav").removeClass("fixed").css("width", "");
		}
	}
};

var alignPosts = () => {
	if ($(".library.page").length) {
		if (window.innerWidth >= 768) {
			$(".post").each(function(i){
				if (i > 1) {

					var abovePost = $(".post").eq(i-2);
					var posY = $(this).offset().top - (abovePost.offset().top + abovePost.height() + 10);

					$(this).css("top", "-"+posY+"px");

				}
			});
		} else {
			$(".post").css("top", "");
		}
	}
}

/********************** BOOTSTRAP CAROUSEL JS ***********************/

// Activating the carousel (disabling automatic transition)
$(".carousel").carousel({interval: false});

// Enabling Carousel Indicators
$(".carousel-indicators > li").click(function(){
	var item = $(this);
	item.parent(".carousel").carousel( item.index() );
});

// Enabling Carousel Controls
$(".left").click(function(){
	$(this).parent(".carousel").carousel("prev");
});

$(".right").click(function(){
	$(this).parent(".carousel").carousel("next");
});

/********************** End of BOOTSTRAP CAROUSEL JS ***********************/

alignPosts();

window.onresize = alignPosts;

$("#toTop").click(function(){
	$("html, body").animate({
		scrollTop: 0
	}, 500, "easeInOutExpo")
});

if ($(".cinema.page").length) {
	$(".cinema.page section .col").each(function(){
		$(this).css({
			backgroundImage: "linear-gradient(-45deg," + randomRGBA(.35) + "," + randomRGBA(.35) + ")"
		})
	})
}

if ($(".library.page .post-media").length) {
	$(".post-media").append("<div class='centre loader'></div>");
	document.onreadystatechange = function() {
		if (document.readyState == 'complete') {
			$(".loader").fadeOut(function(){
				$(this).remove();
			})
		}
	}
}

$("#key").click(function(){
	var v = 100;
	$(this).css("transition", "0s").addClass("turn").get(0).addEventListener("animationend", function() {
		$(this).fadeOut(function(){
			$(".door").delay(2000).each(function(i){
				v *= -1;
				$(this).css({transform: "translateX(" + v + "%)"});
			})
			.get(-1).addEventListener("transitionend", function() {
				$(".homescreen").delay(1000).hide();
				$(".link img").each(function(i) { $(this).delay(i * 400).fadeIn() })
			});
		});
	});
})

$(".menu-icon").click(function() {
	var deviceType = detect.parse(navigator.userAgent).device.type;
	var cond = window.innerWidth >= 768 && /Desktop|Tablet/.test(deviceType);
	var elm = cond ? ".global-nav" : "nav";
	if (!$(".admin").length) {
		$(this).children().toggleClass("is-active");
		$(elm).stop().slideToggle(200, function() {
			if ($(this).css("display") === "none") $(this).css("display", ""); 
		})
	};
});

$("#newpost > .submit").click(function(e) {
	e.preventDefault();
	var data = {};
	var result = $("#newpost .result");
	result.text("Submitting...");

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
				result.stop().text(msg).delay(5000).fadeOut(function(){
					$(this).text("").css("display", "");
				});
			}
			$("#newpost .details, #newpost :file").val("");
			$("#newpost :file").trigger('fileselect');
		});
	}
});

$("#newpost .uploader .submit").click(function(e){
	e.preventDefault();
	uploader({
		id: 'newpost',
		postUrl: '/admin/library/post/media/upload'
	})
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
		result.stop().text(r).delay(5000).fadeOut(function(){
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
			p.slideUp(function(){
				$(this).remove();
				if (!$(".post").length) $("#posts").css({display: "none", transition: "none"}).html('<p style="text-align: center;">No posts yet...</p>').fadeIn(function() {
					$(this).css({transition: ""});
				});
			});
		});
	}
});

var sotwResultTxt = $("#sotw .result").text();

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
				$(this).text(sotwResultTxt).css("display", "");
			});
		}
		$("#sotw .details, #sotw :file").val("");
		$("#sotw :file").trigger('fileselect');
	});
});

$("#sotw .uploader .submit").click(function(e) {
	e.preventDefault();

	uploader({
		id: 'sotw',
		postUrl: '/admin/studio/media/upload',
		resultMsg: sotwResultTxt
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
