function ws_basic(t,n,s){var a=$(this);this.go=function(n){s.find(".ws_list").css("transform","translate3d(0,0,0)").stop(!0).animate({left:n?-n+"00%":/Safari/.test(navigator.userAgent)?"0%":0},t.duration,"easeInOutExpo",function(){a.trigger("effectEnd")})}}

// init main object
// jQuery(document).ready - conflicted with some scripts
// Transition time = 2.4s = 20/10
// SlideShow delay = 6.5s = 20/10
jQuery('#wowslider-container1').wowSlider({
	effect:"basic", 
	prev:"", 
	next:"", 
	duration: 20*100, 
	delay:20*100, 
	width:960,
	height:360,
	autoPlay:true,
	playPause:false,
	stopOnHover:false,
	loop:false,
	bullets:true,
	caption: true, 
	captionEffect:"move",
	controls:true,
	onBeforeStep:0,
	images:0
});
