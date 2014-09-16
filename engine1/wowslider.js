/** WOWSlider version 3.1
  Created by WowSlider.com
  Modified 10:37 13.03.2013
  Using structure
  <div id=wowslider-container>
 	<div class=ws_images><ul>
 		<li><a><img src="..." id=wows0 /></a></li>...
 	</ul></div>
 	<div class=ws_bullets>
 		<a href="#wows0"></a>...
 	</div>
 	<div class=ws_bullets>
 		<a href="#wows0"></a>...
 	</div>
 	<div class=ws_shadow></div>
  </div>

  z-index:
 	-1 = .ws_shadow
 	no = .images - basicaly no z-index
 	8  = .ws_effect, canvas or other overlap object
 	9  = .ws_frame,.ws_logo
  	10 = <cover frame> - between .ws_images||.ws_frame and arrows+bullets
    50 = .ws_title
 	60 = .ws_prev,.ws_next
 	70 = .ws_bullets .ws_thumbs

 */
// exported functions:
//	.wsStart([index]) - start playing [from index] if autoPlay=true, or go to step if autoPlay=false
//	.wsStop() - stop playing
jQuery.fn.wowSlider = function(options){ // rewrite wowslider if exist, for support different wowslider version on same page
	var $=jQuery;
	var $this = this;
	var _this = $this.get(0);
	options = $.extend({

		// ws_XXX = function(options,$images,$container)
		effect: function(){// ws_fade
			this.go = function(new_index,curIdx){
				changeImage(new_index)
				return new_index;
			}
		},// or
		// effect: "effect name", example: "fade","blur"...
		prev:"", // prev button text
		next:"", // next button
		duration:1000, 	// duration of switching  images
		delay:20*100,  	// delay between slides
		captionDuration:1000,// caption show duration
		captionEffect:0,// = "none" | "fade" | "slide" (by default) | "move" | [{left1,top1,left2,top2,distance,easing},...]
						// 		left1,top1,left2,top2 = "INT%" || INT
						// 		distance = FLOAT - delay between caption parts = captionDuration*distance
						// 		easing = easing type, now support "linear|swing|easeInOutExpo|easeOutBack|easeOutElastic1|easeOutCirc" from http://jqueryui.com/demos/effect/easing.html
		width:960,		// slider width (need for some effect only)
		height:360,		// slider height (need for some effect only)
		thumbRate:1,	// scrolling speed and method: 0< scroll when approaching the limits, 0> smartscroll algorithm
		caption: true,	// show caption
		controls:true,	// show controls button (prev/next)
		autoPlay:true,	// auto play slides
		// onBeforeStep: function(curIdx,count){ - raised on before slide step, used to change the switch slides order
		// 		@curIdx - current slide, @count - slides count
		// 		@return - next slide number
		// 		return curIdx+1 // next slide
		// 		return curIdx-1 // prev slide - back order
		// 		return (curIdx+1 + Math.floor((count-1)*Math.random())); // random order
		// }
		// onBeforeStep: function(curIdx){return curIdx+1}, // for example
		// onStep: function(index){}, // raised after step complete
		// options.loop - cycles autoplay, Number.MAX_VALUE by default
		stopOnHover:0,	// stop slideshow on mouse over
		preventCopy:1	// prevent image copy
        // playPause:0 - show play/pause controll
		// startSlide:0 - number of the first slide

		// effect options:

		// basic_linear
		// options.revers - change the direction of transition

		// blast
		// options.cols - columns count
		// options.rows - rows count
		// options.distance = 1 - flight distance
		// options.fadeOut - fadeOut old image

		// blinds
		// options.parts = 3 - parts count
		// options.fadeOut - fadeOut old image

		// blur
		// options.noCanvas - stop using canvas

		// fade
		// options.noCross - Do not use crossfade

		// flip
		// options.rows - row count <height, >0, height/30 by default
		// options.cols - cols count <width, >0, width/90 by default
		// options.type - effect type (0- parallel lines, 1- snake from center, random by default)

		// fly
		// options.revers - change the direction of transition
		// options.distance - width/4 by default


		// ken burns
		// options.paths=[{ from:[X,Y,Ratio], to:[X,Y,Ratio] },...] - transition description
		// 					from - begin state, to - end state
		// 					X,Y = 0..1 - relative position,
		//					Ratio>1 - degree of stretching,

		// rotate
		// options.rotateIn = ..-360..360.. - direction and angle of rotate for new image, default +180
		// options.scaleIn >0 - scale for new image, default 10
		// options.noCross - Do not rotate prev image
		// options.rotateOut= ..-360..360.. - direction and angle of rotate for prev image, default +180
		// options.scaleOut >0 - scale for new image, default 10

		// slices
		// options.fadeOut - fade out old image

		// squares
		// options.fadeOut - fadeOut old image
		// options.type = random | swirl | rain | straight | snakeV | rainV

		// stack
		// options.revers - change the direction of transition
		// options.fadeOut - fade out old image

		// stack_vertical
		// options.revers - change the direction of transition
		// options.fadeOut - fade out old image

	}, options);


	var ws_images = $('.ws_images',$this);
	var ul = ws_images.find('ul');

	function changeImage(index){
		ul.css({left:-index+'00%'});
	}


	// create helper element and reset css of image
	// clone first image for flexibility container expand
	$('<div>')
	.css({
		width:"100%",
		visibility:"hidden",
		"font-size":0,
		"line-height":0
	})
	.append(ws_images.find('li:first img:first').clone().css({width:"100%"}))
	.prependTo(ws_images);
	// disable ul flexibility
	ul.css({
		position: "absolute",
		top:0,
		'animation':'none',
		'-moz-animation':'none',
		'-webkit-animation':'none'
	});

	// start preloader, which add new li instance
	var preloader = options.images && (new wowsliderPreloader(this,options));


	// ----------- init slider -------------

	var elements = ws_images.find('li');
	var elementsCount = elements.length; // init first because effect may added self elements
	function restrictNum(num){
		return ((num||0) + elementsCount) % elementsCount
	};

	/*
		//alert(navigator.userAgent);
		FFWni7		= Mozilla/5.0 (Windows NT 6.1; WOW64; rv:12.0) Gecko/20100101 Firefox/12.0
		ChromeWin7	= Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/19.0.1084.46 Safari/536.5
		SafariWin7	= Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2
		SafariMac	= Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2
		Android		= Mozilla/5.0 (Linux; U; Android 2.3.5; hd-us; eeepc Build/GRJ90) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1
		IPad		= Mozilla/5.0 (iPad; U; CPU OS 4_2 like Mac OS X;en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C134 Safari/6533.18.5
		IPhone		= Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_2 like Mac OS X;en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C134 Safari/6533.18.5
		IE9 		= Mozilla/5.0 (compatible; MSIE9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; FDM; .NET4.0C; .NET4.0E)
		IE8			= Mozilla/5.0 (compatible; MSIE8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; FDM; .NET4.0C; .NET4.0E)
		IE7			= Mozilla/5.0 (compatible; MSIE7.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; FDM; .NET4.0C; .NET4.0E)
	*/

	// restore container and element width
	var navAgent = navigator.userAgent;

	if ((/MSIE/.test(navAgent) && parseInt(/MSIE\s+([\d\.]+)/.exec(navAgent)[1], 10)<8) || (/Safari/.test(navAgent))){
		// display:table don't work for IE7-
		// ?????? Google Chrome (but safari and iOS browser is good) do not it automaticaly expand all cell to real width
		// Safari have some unknown bugs with table structure
		// Google Chrome for 9 images 972x386 do shift...
		var present = Math.pow(10,Math.ceil(Math.LOG10E*Math.log(elementsCount)));// 1 10 100 1000 ...
		ul.css({width:present+'00%'});
		elements.css({width: 100/present+'%'});
	}
	else{
		// opera can't set fractional number percent,
		// IE8+ round fractional number to 2 digit
		// ????????? Chrome for iOS have some unknown bugs with percent width
		ul.css({
			width:elementsCount+'00%',
			display:'table' 	// don't work for IE7-
		});
		elements.css({
			display:'table-cell',
			'float':'none',
			width:'auto'
		});
	};


	var onBeforeStep = options.onBeforeStep || function(curIdx){return curIdx+1};
	options.startSlide = restrictNum(isNaN(options.startSlide)? onBeforeStep(-1,elementsCount): options.startSlide); // if startSlide is not seted than use onBeforeStep() to init slidenumber
	// show first image above all
	changeImage(options.startSlide);


	// prevent image access by drag-and-drop and right click
	var cover;
	if (options.preventCopy && !/iPhone/.test(navigator.platform))// conflict with touch-click event to next/prev button
		cover = $('<div><a href="#" style="display:none;position:absolute;left:0;top:0;width:100%;height:100%"></a></div>').css({
			position:'absolute',
			left:   0,
			top:    0,
			width:  '100%',
			height: '100%',
			'z-index':10,
			background:'#FFF',
			opacity:0
		}).appendTo($this)
		.find('A').get(0); // i work only with A


	// store text and remove from element to fix white gap in google chrome
	// run it before send to effect
	// element stucture variants:
	// <img/>description
	// <a><img/></a>description
	// <div/>description
	var images=[];
	elements.each(function(index){
		var need = $(">img:first,>a:first,>div:first",this).get(0); // only this element need to keep

		var descr = $('<div></div>');
		for (var i=0;i<this.childNodes.length;)
			if (this.childNodes[i]!=need)
				descr.append(this.childNodes[i]);
			else
				i++;

		if(!$(this).data('descr')){
			if(descr.text().replace(/\s+/g, ''))
				$(this).data('descr', descr.html().replace(/^\s+|\s+$/g,''));
			else
				$(this).data('descr', '');
		}

		$(this).css({'font-size': 0});

		// init image list
		images[images.length] = $(">a>img",this).get(0) || $(">*",this).get(0);
	});
	images = $(images);

	images.css('visibility','visible');//??????
	// init effect
	// var images = elements.find('IMG'); // init image after text extract! because it destroy
	if (typeof options.effect=='string') options.effect = window["ws_" + options.effect];
	// ws_XXX = function(options,$images,$container)
	var effect = new options.effect(options, images, ws_images);


	// init engine function
	// async!
	var curIdx = options.startSlide;
	function go(index,dx,dy){
		if (isNaN(index)) index = onBeforeStep(curIdx,elementsCount);
		index = restrictNum(index); // restict 0..elementsCount
		if (curIdx == index) return;

		if (preloader)
			preloader.load(index, function(){
				go1(index,dx,dy);
			})
		else
			go1(index,dx,dy);
	};


	// ------------ regreg 0/4 ----------------
	// simple encode function
	// code each char by function 1 + i%a
	// a=2..32 -encode 2-5 digit
	function encodeDecode(str)
	{
		var outs='';
		for (var i=0; i<str.length; i++) outs += String.fromCharCode(str.charCodeAt(i)^(1+(str.length-i)%32));
		return outs;
	}
	//alert(encodeDecode("qwertydsafdasfgsdfsadffdsafdsaf"));
	// ------------ regreg 0/4 ----------------

	options.loop = options.loop || Number.MAX_VALUE;
	options.stopOn = restrictNum(options.stopOn); // re-init after elementsCount
	// first stage
	function go1(index,dx,dy){
		// try run effect
		var index = effect.go(index,curIdx,dx,dy);
		if (index<0) return; // if effect not started (may be if previous stage is busy)

		$this.trigger( $.Event("go", {index:index}) );

		// interface
		go2(index);
		if (options.caption) setTitle(elements[index]);
		curIdx = index;

		// do restart play only after step
		// @todo but if preloading fail?
		if (curIdx==options.stopOn && !--options.loop) options.autoPlay = 0; // stop after options.loop loops
		restartPlay();

		if (options.onStep) options.onStep(index); // run after all to prevent crash
	}

	// obj, onmove(e,dX,dY), onstart(e), onend(e,isMoving), onclick(e)
	function touch(e,m,s,n,c){ new _touch(e,m,s,n,c) }
	function _touch(obj, onmove,onstart,onend,onclick){
		// attach touch event
		// use addEventListener, because jquery bind return unstandart event
		var startX, startY, isMoved = 0,
			isMoving = 0; // bool

		if (obj.addEventListener){
			obj.addEventListener('touchmove',
				function(e){
					isMoved = 1;
					if(isMoving){
						//event.preventDefault();
						if (onmove(e,startX - e.touches[0].pageX,startY - e.touches[0].pageY)){
							startX =
							startY =
							isMoving = 0;
						}
					}
					return false;
				},
				false
			);

			obj.addEventListener('touchstart',
				function(e){
					isMoved = 0;
					if (e.touches.length == 1){// ==1 - detect own finger
						startX = e.touches[0].pageX;
						startY = e.touches[0].pageY;
						isMoving = 1;
						if (onstart) onstart(e);
					}
					else
						isMoving = 0;
				},
				false
			);

			obj.addEventListener('touchend', function(e){
				isMoving = 0;
				if (onend) onend(e);
				if (!isMoved && onclick) onclick(e);

			}, false);
		}

	}

	// ------------ regreg 1/4 ----------------
	// check and create overlay contaner
	var c = ws_images, wm="$#\"";
	// ------------ regreg 1/4 ----------------

	// ------------ regreg 2/4 ----------------
	// alert(encodeDecode(wm));
	if (!wm) return; // protect code for simple delete watermark
	wm = encodeDecode(wm); //
	if (!wm) return; // posibility to use some spaces for emulate empty watermark
	else // ;)
	// ------------ regreg 2/4 ----------------


	touch(
		cover?cover.parentNode:ws_images.get(0),
		function(e,dx,dy){
			if ((Math.abs(dx) > 20) || (Math.abs(dy) > 20)){ // min_move
				forceGo(e, curIdx+((dx+dy)>0? 1: -1), dx/20, dy/20); // = (|dx|>|dy| && dx>0) || (|dx|<|dy| && dy>0)
				return 1;
			}
			return 0;
		},
		0,0,
		// click
		function(){
			var href = $('A', elements.get(curIdx)).get(0);
			if (href) {
			    var dispatch = document.createEvent("HTMLEvents")
				dispatch.initEvent("click", true, true);
				href.dispatchEvent(dispatch);
			}
		}
	);


	var wsBullets = $this.find('.ws_bullets');
	var wsThumbs = $this.find('.ws_thumbs');
	function go2(index){
		if (wsBullets.length) setBullet(index);
		if (wsThumbs.length) setThumb(index);

		// if exist prevented div then redirect link to it
		if (cover){
			var href = $('A', elements.get(index)).get(0);
			if (href){
				cover.setAttribute('href', href.href);
				cover.setAttribute('target', href.target);
				cover.style.display='block';
			}
			else
				cover.style.display='none';
		}
	}


	// autoplay
	var autoplay = options.autoPlay;
	function raiseStop(){
		if (autoplay){
			// trigger an artificial stop event
			autoplay=0;
			setTimeout(function(){
				$this.trigger( $.Event("stop", {}) )
			}, options.duration);
		}
	}
	function raiseStart(){
		if (!autoplay && options.autoPlay){
			autoplay=1;
			$this.trigger( $.Event("start",{}) );
		}
	}

	function stop(){
		stopPlay();
		raiseStop();
	}

	var autoPlayTimer;
    var mouseIsOver = false;

    function restartPlay(noDur) {
        stopPlay();

        if (options.autoPlay) {
            autoPlayTimer = setTimeout(function () {
                if (!mouseIsOver)
                    go()
            }, options.delay + (noDur ? 0 : options.duration));
			raiseStart();
		}
		else
			raiseStop();
	};
	function stopPlay(){
		if (autoPlayTimer) clearTimeout(autoPlayTimer);
		autoPlayTimer = null;
	};

	function forceGo(event, index,dx,dy){
		stopPlay();
		event.preventDefault();
		go(index,dx,dy);
		restartPlay();
	}


	// ------------ regreg 3/4 ----------------
	// wmblock =
	//alert(encodeDecode('<A style="background-color:#E4EFEB;color:#837F80;'))
	//alert(encodeDecode('position:relative;display:block;font-size:11px;'))
	//alert(encodeDecode('width:auto;height:auto;font-family:Lucida Grande;">'));
	// see regreg 4 part
	var wmblock = encodeDecode(".P0|zt`n7+jfencqmtN{3~swuk\"4S!QUWS+laacy0*041C<39");
	wmblock += encodeDecode("``}dxbeg2uciewkwE$ztokvxa-ty{py*v``y!xcsm=74t{9");

	var ic = c||document.body; // c==ws_images
	wm = wm.replace(/^\s+|\s+$/g,'');// trim for exclude spaces
	c = wm? $('<div>'):0;
	$(c).css({
		position:'absolute',
		padding:'0 0 0 0'
	}).appendTo(ic);

	// for IE use iframe
	if (c && document.all){
		var f = $('<iframe src="javascript:false"></iframe>');
		f.css({
			position:'absolute',
			left:0,
			top:0,
			width:'100%',
			height:'100%',
			filter:'alpha(opacity=0)'
		});

		f.attr({
			scrolling:"no",
			framespacing:0,
			border:0,
			frameBorder:"no"
		});

		c.append(f);
	};
	$(c).css({
		zIndex:11,
		right:'5px',
		bottom:'2px'
    }).appendTo(ic);

    // ------------ regreg 3/4 ----------------

    // ------------ regreg 4/4 ----------------
    // see previous regreg
    wmblock += encodeDecode("czvex5oxxd1amnamp9ctTp%{sun4~v{|xj(]elgim+M{iib`?!<");
    wmblock = c ? $(wmblock) : c;
    if (wmblock) {
        wmblock.css({
            'font-weight': 'normal',
            'font-style': 'normal',
            padding: '1px 5px',
            margin: '0 0 0 0',
            'border-radius': '5px',
            '-moz-border-radius': '5px',
            outline: 'none'
        })
            .attr({href: 'ht' + 'tp://' + wm.toLowerCase()})
            .html(wm)
            .bind('contextmenu', function (eventObject) {
                return false;
            })
            .show()// check visibility
            .appendTo(c || document.body)
            .attr("target", "_blank");
    }
    // ------------ regreg ----------------


    // add arrows
    if (options.controls) {
        var $next_photo = $('<a href="#" class="ws_next">' + options.next + '</a>');
        var $prev_photo = $('<a href="#" class="ws_prev">' + options.prev + '</a>');
        $this.append($next_photo);
        $this.append($prev_photo);

        /**
         * when hovering each one of the images,
         * we show the button to navigate through them
         *
         $this.live('mouseenter',function(){
			$next_photo.show();
			$prev_photo.show();
		}).live('mouseleave',function(){
			$next_photo.hide();
			$prev_photo.hide();
		});*/

		$next_photo.bind('click', function (e){ forceGo(e, curIdx+1) });
		$prev_photo.bind('click', function (e){ forceGo(e, curIdx-1) });

        // conflict with touch-click event
        if (/iPhone/.test(navigator.platform)){
			$prev_photo.get(0).addEventListener('touchend', function (e){ forceGo(e, curIdx-1) }, false);
			$next_photo.get(0).addEventListener('touchend', function (e){ forceGo(e, curIdx+1) }, false);
		}
	};

	// bullets, tooltip,
	var thumbRate = options.thumbRate; // scrolling speed and method
	var wsThumbsHover;
	function initBullets(){
		// init bullets click
		$this.find('.ws_bullets a,.ws_thumbs a').click(function(e){ forceGo(e, $(this).index()) });

		if (wsThumbs.length){
			//wsThumbs.niceScroll({touchbehavior :true});
			wsThumbs.hover(function(){wsThumbsHover=1},function(){wsThumbsHover=0});// jquery is(:hover) not working in ie8-
			var thumbs_cont = wsThumbs.find('>div');
			wsThumbs.css({overflow:'hidden'});

			var oldPos;
			var outTime;
			var touchEn; // off mousemove if touch enabled
			var ws_thumbs = $this.find('.ws_thumbs');
			ws_thumbs.bind("mousemove mouseover", function(e){
				if (touchEn) return;
				clearTimeout(outTime);

				var delta = 0.2; // must be < 0.5
				for(var i=0; i<2; i++){
					var size = wsThumbs[i?'width':'height'](),// thumb window size
						csize=thumbs_cont[i?'width':'height'](),// thums container size
						scrollSize=size-csize;

					if (scrollSize<0){ // size<csize
						var endpos,time,
							pos = (
									e[i?'pageX':'pageY'] - wsThumbs.offset()[i?'left':'top'] // relative cursor position
								)/size;// 0..1 scaled cursor position

						if (oldPos == pos) return;
						oldPos = pos;

						thumbs_cont.stop(true);

						// scroll when approaching the limits
						if (thumbRate>0){
							// moving only from delta
							if ((pos>delta)&&(pos<1-delta)) return;

							// pos = 0..0.5-d  0.5+d..1
							endpos = pos<0.5? 0: scrollSize-1;
							// 0.5-Math.abs(pos) = 0..(0.5-d)
							// calc speed
							time = thumbRate * Math.abs(thumbs_cont.position()[i?'left':'top']-endpos)/(Math.abs(pos-0.5) - delta); //may by 0.5-delta?
						}

						// smartscroll algorithm
						else{
							endpos = scrollSize * Math.min(Math.max(
										(pos - delta)/(1-2*delta) // expanded by delta
									,0),1);// 0..0.1..0.9..1 => 0..0..1..1

							time = -thumbRate * csize/2;
						}

						thumbs_cont.animate(i?{left:endpos}:{top:endpos}, time, thumbRate>0? "linear": "easeOutCubic");
					}
					else
						thumbs_cont.css(i?'left':'top',i?scrollSize/2:0);
				}
			});

			ws_thumbs.mouseout(function(e){
				outTime = setTimeout(function(){
					thumbs_cont.stop();
					// console.log("mouseout");
				},100);
			})


			wsThumbs.trigger('mousemove');
			var tLeft,tTop;
			touch(thumbs_cont.get(0),
				// onmove
				function(e,dx,dy){
					thumbs_cont.css('left',Math.min(Math.max(tLeft-dx,wsThumbs.width()-thumbs_cont.width()),0));
					thumbs_cont.css('top', Math.min(Math.max(tTop-dy,wsThumbs.height()-thumbs_cont.height()),0));
					e.preventDefault();
					return false;
				},
				// onstart
				function(e){
					tLeft = parseFloat(thumbs_cont.css('left'))||0;
					tTop  = parseFloat(thumbs_cont.css('top' ))||0;
					return false;
				}
			);

			// iPh* onclick emulation
			$this.find('.ws_thumbs a').each(function(i,obj){
				touch(obj,
					0,0,
					function(e){touchEn=1},
					// click()
					function(e){
						forceGo(e, $(obj).index());
					}
				);
			})

		};

		if (wsBullets.length){
			// Tooltip's
			var bullets_cont = wsBullets.find('>div');
			var $bullets = $('a', wsBullets);
			var $thumbs = $bullets.find('IMG');
			if ($thumbs.length){
				// create tooltip frame
				var mainFrame = $('<div class="ws_bulframe"/>').appendTo(bullets_cont);	// main frame
				var imgContainer = $('<div/>').css({width: $thumbs.length + 1+'00%'}).appendTo($('<div/>').appendTo(mainFrame));	// images container
				$thumbs.appendTo(imgContainer);		// move image to new image container
				$('<span/>').appendTo(mainFrame);	// triangle

				// move to the bullet
				var curIndex=-1;
				function moveTooltip(index){
					if (index<0) index=0;
					if (preloader) preloader.loadTtip(index);

					$($bullets.get(curIndex)).removeClass('ws_overbull');
					$($bullets.get(index)).addClass('ws_overbull');

					mainFrame.show();
					var mainCSS = {
						left: $bullets.get(index).offsetLeft - mainFrame.width()/2,
						// correct Y position for several bullets lines
						'margin-top': $bullets.get(index).offsetTop - $bullets.get(0).offsetTop+'px',
						'margin-bottom': -$bullets.get(index).offsetTop + $bullets.get($bullets.length-1).offsetTop+'px'
					};
					var cimg = $thumbs.get(index);
					var contCSS = { left:-cimg.offsetLeft+($(cimg).outerWidth(true)-$(cimg).outerWidth())/2};

					if (curIndex<0){
						mainFrame.css(mainCSS);
						imgContainer.css(contCSS);
					}
					else{
						if (!document.all) mainCSS.opacity = 1;
						mainFrame.stop().animate(mainCSS, 'fast');
						imgContainer.stop().animate(contCSS, 'fast');
					}

					curIndex = index;
				}

				$bullets.hover(function(){ moveTooltip($(this).index()) });

				// show/hide
				var hideTime;
				bullets_cont.hover(
					function(){
						if (hideTime) { clearTimeout(hideTime); hideTime=0 };
						moveTooltip(curIndex)
					},
					function(){
						$bullets.removeClass('ws_overbull');
						if (document.all){
							if (!hideTime) hideTime = setTimeout(function(){
								mainFrame.hide();
								hideTime=0;
							},400);
						}
						else
							mainFrame.stop().animate(
								{ opacity: 0 },
								{ duration: 'fast', complete: function(){mainFrame.hide()} }
							);
					}
				);
				bullets_cont.click(function(e){ forceGo(e, $(e.target).index()) });
			}
		}
	}

	function setThumb(new_index){
		$("A", wsThumbs).each(function(index){
			if (index == new_index){
				var thumb = $(this);
				thumb.addClass("ws_selthumb");
				if (!wsThumbsHover){ // eliminate flickering
					// moving to current
					var thCont = wsThumbs.find('>div'),
						tpos = thumb.position() || {},
						cpos = thCont.position() || {};
					thCont.stop(true).animate({
						left: -Math.max(Math.min( tpos.left, -cpos.left), tpos.left+thumb.width() -wsThumbs.width()),
						top : -Math.max(Math.min( tpos.top , 0 ), tpos.top +thumb.height()-wsThumbs.height() )
					});
				}
			}
			else
				$(this).removeClass("ws_selthumb");
		});
	}

	function setBullet(new_index){
		$("A", wsBullets).each(function(index){
			if (index == new_index)
				$(this).addClass("ws_selbull")
			else
				$(this).removeClass("ws_selbull");
		})
	}


	// create title bar
	if (options.caption){
		$caption = $("<div class='ws-title' style='display:none'></div>");
		$this.append($caption);
		$caption.bind('mouseover', function(e){ stopPlay() });
		$caption.bind('mouseout', function(e){ restartPlay() });
	}


	var removeFilters = function(){ if(this.filters) this.style.removeAttribute('filter') }
	// caption effects
	var captionEffects = {
			none:function(effect,$Title){
				$Title.show();
			},

			fade:function(effect,$Title,captionDuration){
				//$Title.fadeIn(400,function(){if($.browser.msie) $(this).get(0).style.removeAttribute('filter') });//css({opacity: 0}).animate({opacity: 'show'}, 400);
				$Title.fadeIn(captionDuration, removeFilters);
			},

			// move & custom effect
			array:function(effect,$Title,captionDuration){
				showCustomEffect($Title,
					effect[Math.floor(Math.random() * effect.length)],
					0.5, // distance
					"easeOutElastic1", // easing
					captionDuration // duration
				);
			},

			move:function(effect,$Title,captionDuration){
				captionEffects.array([ // predefines for move effect
						{left1:"100%",top2:"100%"}, // from right bottom %
						{left1:"80%",left2:"-50%"}, // from left right %
						{top1:"-100%",top2:"100%",distance:0.7,easing:"easeOutBack"}, // from top bottom %
						{top1:"-80%",top2:"-80%",distance:0.3,easing:"easeOutBack"}, // from top %
						{top1:'-80%',left2:'80%'}, // from top right %
						{left1:"80%",left2:"80%"} // from right %
					],
					$Title,captionDuration
				);
			},

			slide:function(effect,$Title,captionDuration){
				showWithSlide($Title, {
					direction:'left',
					easing:"easeInOutExpo",
					complete: function(){ if($Title.get(0).filters) $Title.get(0).style.removeAttribute('filter') },
					duration: captionDuration
				})
			}
	};

	// default
	captionEffects[0] = captionEffects.slide;

	function setTitle(elem){
		var title = $('img', elem).attr("title");
		var descr = $(elem).data('descr');
		
		if(!title.replace(/\s+/g, ''))
			title = "";
		
		var $Title = $('.ws-title', $this);
		$Title.stop(1,1).stop(1,1)
			.fadeOut(options.captionDuration/3,function(){
				if (title||descr){
					$Title.html((title? '<span>'+title+'</span>': '') + (descr? '<div>'+descr+'</div>': ''));

					var captionEffect = options.captionEffect;
					(captionEffects[$.type(captionEffect)] || captionEffects[captionEffect] || captionEffects[0])
						(captionEffect, $Title,options.captionDuration);
				}
			});
	}


	// ------ additional function
	// from easyjs
	function cStyle(el, p_name){
		var val, dv = document.defaultView;

		// other
		if (dv && dv.getComputedStyle){
			var s = dv.getComputedStyle(el,'');
			if (s) val = s.getPropertyValue(p_name);
		}
		else {
			var pName = p_name.replace(/\-\w/g,function(s){return s.charAt(1).toUpperCase()});
			if(el.currentStyle)
				val = el.currentStyle[pName];
			else
				val = el.style[pName];
		}

		return val;
	};

	function myWidth(el,outer,margins){
		var names = "padding-left|padding-right|border-left-width|border-right-width".split("|");
		var padding = 0;
		for (var i=0; i<names.length; i++)
			padding += parseFloat(cStyle(el,names[i])) || 0;

		var res = parseFloat(cStyle(el,'width'))
				|| ((el.offsetWidth||0)-padding); // in ie computedStyle more right then offsetWidth
		if (outer) res += padding;
		if (margins)
			res += (parseFloat(cStyle(el,"margin-left"))||0) + (parseFloat(cStyle(el,"margin-right"))||0);
		return res
	}

	function myHeight(el,outer,margins){
		var names = "padding-top|padding-bottom|border-top-width|border-bottom-width".split("|");
		var padding = 0;
		for (var i=0; i<names.length; i++)
			padding += parseFloat(cStyle(el,names[i])) || 0;

		var res = parseFloat(cStyle(el,'height'))
				|| ((el.offsetHeight||0)-padding); // in ie computedStyle more right then offsetWidth
		if (outer) res += padding;
		if (margins)
			res += (parseFloat(cStyle(el,"margin-top"))||0) + (parseFloat(cStyle(el,"margin-bottom"))||0);
		return res
	}


	// options:
	//	direction:'left',
	//	easing:"easeInOutExpo",
	//	duration: options.captionDuration
	function showCustomEffect(element,direction,distance,easing,duration){

		var els = element.find('>span,>div').get();

		// start state
		$(els).css({position:'relative',visibility:"hidden"});
		element.show();

		// start position
		for (var p in direction)
			if (/\%/.test(direction[p])){ // persent position
				direction[p] = parseInt(direction[p])/100;
				var pos = element.offset()[/left/.test(p)?'left':'top'];
				var size = /left/.test(p)?'width':'height';
				if (direction[p]<0)
					direction[p] *= pos
				else
					direction[p] *= $this[size]() - element[size]() - pos;
			}


		$(els[0]).css({left:(direction.left1||0)+'px', top:(direction.top1||0)+'px'});
		$(els[1]).css({left:(direction.left2||0)+'px', top:(direction.top2||0)+'px'});

		// animate
		var duration = direction.duration || duration;
		function startAnimation(i){
			//linear easeOutCubic easeInCubic easeOutBack
			var op = $(els[i]).css('opacity'); // backup opacity
			$(els[i]).css({visibility:'visible'})
					 .css({opacity:0})// set opacity after visible because of bug in ie8
					 .animate({opacity:op},duration,"easeOutCirc")
					 .animate({top:0,left:0},{duration:duration,easing:(direction.easing || easing),queue:false});
		}
		startAnimation(0);
		setTimeout(function(){ startAnimation(1) },duration*(direction.distance || distance));
	}

	// showWithSlide restored from jquery ui effect.slide
	// options {direction,distance,easing,duration}
	function showWithSlide(element,options){

		// Save & Show
		var bkp_css = {position:0,top:0,left:0,bottom:0,right:0};
		for(var p in bkp_css)
			bkp_css[p] = element.get(0).style[p];// jquery css work wrong in IE7

		element.show();


		// Wraps the element around a wrapper that copies position properties
		// wrap the element
		//alert(cStyle(element.get(0),'padding-left'));
		//alert(element.get(0).offsetWidth)
		//alert(myWidth(element.get(0),1,1));

		var wrap_props = {
				width: myWidth(element.get(0),1,1),//+(document.all?1:0),// +1 need for correct real width with floating point in IE
				height: myHeight(element.get(0),1,1),
				'float': element.css('float'),
				overflow:'hidden',
				opacity: 0.0
			};
		for(var p in bkp_css) wrap_props[p] = bkp_css[p] || cStyle(element.get(0),p);

		var wrapper = $('<div></div>')
			.css({
				fontSize: '100%',
				background: 'transparent',
				border: 'none',
				margin: 0,
				padding: 0
			});

		element.wrap(wrapper);
		wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually loose the reference to the wrapped element

		// transfer positioning properties to the wrapper
		if (element.css('position') == 'static') {
			wrapper.css({ position: 'relative' });
			element.css({ position: 'relative' });
		} else {
			$.extend(wrap_props, {
				position: element.css('position'),
				zIndex: element.css('z-index')
			});
			/*$.each(['top', 'left', 'bottom', 'right'], function(i, pos) {
				wrap_props[pos] = element.css(pos);
				if (isNaN(parseInt(wrap_props[pos], 10))) {
					wrap_props[pos] = 'auto';
				}
			});*/
			element.css({position: 'absolute', top: 0, left: 0, right: 'auto', bottom: 'auto' });
		}
		wrapper.css(wrap_props).show();

		// prepare animation
		var direction = options.direction || 'left'; // Default Direction
		var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';
		var pos_neg = (direction == 'up' || direction == 'left'); // positive / negative
		var distance = options.distance || (ref == 'top' ? element.outerHeight(true) : element.outerWidth(true));
		element.css(ref, pos_neg ? (isNaN(distance) ? "-" + distance : -distance) : distance); // Shift

		// Animation
		var animation = {};
		animation[ref] = (pos_neg ? '+=' : '-=') + distance;

		wrapper.animate({opacity:1.0},{duration: options.duration, easing: options.easing}); // fadeIn
		element.animate(animation, { queue: false, duration: options.duration, easing: options.easing, complete: function(){
			// Restore
			element.css(bkp_css);
			element.parent().replaceWith(element);
			if (options.complete) options.complete();
		}});
	}



	// init and start play
	if (wsBullets.length || wsThumbs.length) initBullets();
	go2(curIdx);
	if (options.caption) setTitle(elements[curIdx]);
	if (options.stopOnHover){
        this.bind('mouseover', function (e) {
            stopPlay();
            mouseIsOver = true;
            console.info(mouseIsOver);
        });
        this.bind('mouseout', function (e) {
            restartPlay();
            mouseIsOver = false;
            console.info(mouseIsOver);
        });
	}
	restartPlay(1);

	// sound support
	var sound = $this.find("audio").get(0);
	if (sound){
		// init sound object
		if (window.Audio && sound.canPlayType && sound.canPlayType('audio/mp3')){
			sound.loop="loop";
			if (options.autoPlay){
				sound.autoplay = "autoplay";
				//sound.onload = function(){sound.play()};
				setTimeout(function(){sound.play()},100); // prev line doesn't play in ie10
			}
			//sound.src = options.sound;
			//sound.onended=function(){setTimeout(function(){sound.play()},300)}; - for loop support in unsuport devices
			//if (!options.paused) sound.play();
		}
		else{
			sound = sound.src; // use only src of sound
			var path = sound.substring(0, sound.length-/[^\\\/]+$/.exec(sound)[0].length); // path of mp3 == swf

			var soundId = "wsSound"+Math.round(Math.random()*9999);
			$("<div>").appendTo($this).get(0).id = soundId;

			var soundListener = "wsSL"+Math.round(Math.random()*9999);
			window[soundListener] = { onInit : function(){} };

			// attr,par,id
			swfobject.createSWF(
				{ data:path + "player_mp3_js.swf", width:"1", height:"1" },
				{ allowScriptAccess:'always', loop:true, FlashVars: "listener="+soundListener+"&loop=1&autoplay="+(options.autoPlay?1:0)+"&mp3="+sound },
				soundId
			);
			sound=0; // clear for use flash instead
		}

		// bind pause/play event
		$this.bind("stop", function(){
			if (sound)
				sound.pause();
			else
				$(soundId).SetVariable("method:pause", "");
		});

		$this.bind("start", function(){
			if (sound)
				sound.play();
			else
				$(soundId).SetVariable("method:play", "");
		});
	}


	// export some functions
	_this.wsStart = go;	 // wsStart(index-to-go);
	_this.wsStop = stop;


    // play/pause
    if (options.playPause) {
        var pp_button = $("<a href=\"#\" class=\"ws_playpause\"></a>");
        if (options.autoPlay)
            pp_button.addClass("ws_pause");
        else
            pp_button.addClass("ws_play");

        pp_button.click(function () {
            options.autoPlay = !options.autoPlay;
            if (!options.autoPlay) {
                _this.wsStop();
                pp_button.removeClass("ws_pause");
                pp_button.addClass("ws_play");
            } else {
                restartPlay();
                pp_button.removeClass("ws_play");
                pp_button.addClass("ws_pause");
            }
			return false;
        });
        this.append(pp_button);
    }
	
	
	// responsive
	// not support IE < 9
	if(document.addEventListener){
		$(function(){
			// change bullets size
			var bulframe = $(".ws_bulframe", $this);
			var bul_width = bulframe.width();
			
			// calculate current size
			function calc_size(from, to){
				return Math.max(Math.min(($this.width()/options.width), 1)*from, to);
			}
			
			function set_responsive(){
				// change font-size title, description
				$this.css('fontSize', calc_size(10, 6));
				
				// change bulframe size
				bulframe.css('width', calc_size(bul_width, 0));
			}
			
			set_responsive();
			$(window).resize(set_responsive);
		})
	}
	
	return this;
};

// exported and using easings
jQuery.extend( jQuery.easing,
{
	// linear and swing
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	// =easeOutElastic but period = Math.PI/2 instead of 2*Math.PI;
	easeOutElastic1: function (x, t, b, c, d) {
		var T=Math.PI/2;
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/T * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*T/p ) + c + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}
});
