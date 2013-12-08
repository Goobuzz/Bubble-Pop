require([
	'js/Game',
	'js/Time',
	'js/Input',
	'js/Cursor',
	'goo/loaders/DynamicLoader',
	'goo/math/Vector3',
	'goo/util/rsvp',
	'goo/entities/EntityUtils'
], function (
	Game,
	Time,
	Input,
	Cursor,
	DynamicLoader,
	Vector3,
	RSVP,
	EntityUtils
) {
	'use strict';
	function init() {

		// If you try to load a scene without a server, you're gonna have a bad time
		if (window.location.protocol==='file:') {
			alert('You need to run this webpage on a server. Check the code for links and details.');
			return;

			/*

			Loading scenes uses AJAX requests, which require that the webpage is accessed via http. Setting up 
			a web server is not very complicated, and there are lots of free options. Here are some suggestions 
			that will do the job and do it well, but there are lots of other options.

			- Windows

			There's Apache (http://httpd.apache.org/docs/current/platform/windows.html)
			There's nginx (http://nginx.org/en/docs/windows.html)
			And for the truly lightweight, there's mongoose (https://code.google.com/p/mongoose/)

			- Linux
			Most distributions have neat packages for Apache (http://httpd.apache.org/) and nginx
			(http://nginx.org/en/docs/windows.html) and about a gazillion other options that didn't 
			fit in here. 
			One option is calling 'python -m SimpleHTTPServer' inside the unpacked folder if you have python installed.


			- Mac OS X

			Most Mac users will have Apache web server bundled with the OS. 
			Read this to get started: http://osxdaily.com/2012/09/02/start-apache-web-server-mac-os-x/

			*/
		}

		// Make sure user is running Chrome/Firefox and that a WebGL context works
		var isChrome, isFirefox, isIE, isOpera, isSafari, isCocoonJS;
	 	isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	  	isFirefox = typeof InstallTrigger !== 'undefined';
	  	isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	  	isChrome = !!window.chrome && !isOpera;
	  	isIE = false || document.documentMode;
	  	isCocoonJS = navigator.appName === "Ludei CocoonJS";
		if (!(isFirefox || isChrome || isSafari || isCocoonJS)) {
			alert("Sorry, but your browser is not supported.\nGoo works best in Google Chrome or Mozilla Firefox.\nYou will be redirected to a download page.");
			window.location.href = 'https://www.google.com/chrome';
		} else if (!window.WebGLRenderingContext) {
			alert("Sorry, but we could not find a WebGL rendering context.\nYou will be redirected to a troubleshooting page.");
			window.location.href = 'http://get.webgl.org/troubleshooting';
		} else {
			Game.world.setSystem(new Time(Game));

			// add a callback for when they click 'play'
			$('#playButton').click(function(){
				console.log("Clicked PlayButton");
				// hide the menu
				$('#menu').hide();
				// show the loading screen
				$('#loadingOverlay').show();
				$('#loadingOverlay .loadingMessage').show();
				$('#loadingOverlay .progressBar').show();
				loadGame();
			});

			// add a callback for credits and instructions
			// $('#instructionsButton').click(function(){}
			// $('#creditsButton').click(function(){}

			// list of sounds
			var sound = {};
			// load a new sound 'sprite'
			sound.pop = new Howl({
				urls: ["res/Sounds/bubble pop.ogg", "res/Sounds/bubble pop.mp3"],
				sprite:{
					// offset, duration
					pop0:[0, 250],
					pop1:[400, 250],
					pop2:[900, 250],
					pop3:[1400, 250],
					pop4:[1900, 250],
					pop5:[2400, 250],
					pop6:[2900, 250]
				},
				volume:1.0});
			// load another sound 'sprite'
			sound.fart = new Howl({
				urls: ["res/Sounds/sloppyFart.ogg", "res/Sounds/sloppyFart.mp3"],
				sprite:{
					// offset, duration
					fart0:[0, 650],
					fart1:[690, 300],
					fart2:[1000, 600]
				},
				volume:1.0});

			var loadGame = function(){
				console.log("Loading Game.");
				// Loading screen callback (this doesn't seem to work)
				var progressCallback = function (handled, total) {
					var loadedPercent = (100*handled/total).toFixed();
					console.log("this never gets called...");
					$('#loadingOverlay .progressBar .progress').css('width', loadedPercent+'%');
				};
				
				// The loader takes care of loading the data
				var loader = new DynamicLoader({
					world: Game.world,
					rootPath: 'res',
					progressCallback: progressCallback});
				RSVP.all([
					// load multiple bundles here in the array
					loader.loadFromBundle('project.project', 'root.bundle', {recursive: false, preloadBinaries: true})
				]).
				then(function(){
					// show what was loaded
					console.log(loader._configs);
					// used later for raycasting
					Game.viewCam = loader.getCachedObjectForRef("entities/Camera.entity");
					// reference to the pink bubbles
					Game.bubbleRef = loader.getCachedObjectForRef("entities/Sphere.entity");
					Game.bubbleRef.removeFromWorld();
					// reference to the green bubbles
					Game.fartBubbleRef = loader.getCachedObjectForRef("entities/Sphere_0.entity");
					Game.fartBubbleRef.removeFromWorld();
					
					// hide the progress bar
					$('#loadingOverlay').hide();
					$('#loadingOverlay .loadingMessage').hide();
					$('#loadingOverlay .progressBar').hide();
					// start the game
					startGame();
				}).
				then(null, function(e){
					alert("Failed to load scene: "+e);
					console.log(e.stack);
				});
			};
			var startGame = function(){
				// hide the cursor for 'everything'
				$('*').css('cursor', 'none');
				// create a new cursor, pass in the image url
				// and 'offset X, and Y'
				var c = new Cursor({url:"res/Cursors/target.png", x:64, y:64});

				// assign the left mouse to the 'PopBubble' action
				Input.assignMouseButtonToAction(1, "PopBubble");
				// when the PopBubble action happens call the popBubble function
				Game.register("PopBubble", Game, popBubble);
				function popBubble(bool0){
					if(bool0){
						// use the camera to set the ray origin and direciton
						// based on the mouse position
						Game.viewCam.cameraComponent.camera.getPickRay(
							Input.mousePosition.x,
							Input.mousePosition.y,
							Game.renderer.viewportWidth,
							Game.renderer.viewportHeight,
							Game.ray
							);
						// cast a ray, get the results back as 'hit'
						var hit = Game.castRay(Game.ray, 1);
						// if there was a hit
						if(hit){
							// play the sound
							sound[hit.entity.soundPrefix].play(hit.entity.soundPrefix+hit.entity.soundID);
							// remove the bubble from getting 'Update' events
							Game.unregister("Update", hit.entity);
							// remove the entity from the world
							hit.entity.removeFromWorld();
						}
					}
				};
				// When there is an 'Update' event, call the bubbleGenerator function
				Game.register("Update", Game, bubbleGenerator);
				// used to track time between bubbles
				var nextTime = 0.0
				function bubbleGenerator(){
					// if enough time has passed
					if(nextTime < Time.time){
						// set the next time
						nextTime = Time.time + Math.random();
						// variable used to store the bubble entity
						var b;
						// if the random number is greater than 0.8
						if(Math.random()>0.8){
							// clone the fartBubble
							b = EntityUtils.clone(Game.world, Game.fartBubbleRef);
							// set the sound prefix, and ID used above
							b.soundPrefix = 'fart';
							b.soundID = Math.floor(Math.random()*3);
						}
						else{
							// if the random number is from 0 to 0.8
							// clone the normal bubble
							b = EntityUtils.clone(Game.world, Game.bubbleRef);
							// set the sound prefix and ID used above
							b.soundPrefix = 'pop';
							b.soundID = Math.floor(Math.random()*7);
						}
						// add the bubble to the world
						b.addToWorld();
						// set this hitMask to 1, to get raycast checks
						// from the PopBubble action
						b.hitMask = 1;
						// store the old position of the object
						//b.oldTrans = new Vector3();
						// these are used for tracking the velocity of the bubbles
						b.xVel = 0.0;
						b.yVel = 10.0;
						// get a random distance from the camera
						var z = -15+Math.random()*30;
						// keep the bubble in view of the camera based
						// on the random distance
						var x = (-30+Math.random()*60)*(10/((15+z)+1));
						// move the bubble to the new position
						b.transformComponent.setTranslation(x, -15, z);
						// during a game 'Update' event, call the bubbleLogic
						// function for this bubble
						Game.register("Update", b, bubbleLogic);
					}

					function bubbleLogic(){ 
						// 'this' is the bubble entity
						var trans = this.transformComponent.transform;
						//this.oldTrans.copy(this.transformComponent.transform.translation);
						// if we are out of view bounds of the camera...
						if(trans.translation.y > 20 || 
							trans.translation.x > 100 ||
							trans.translation.x < -100){
							// remove the bubble from getting 'Update'
							// event callbacks
							Game.unregister("Update", this);
							// remove the bubble from the world
							this.removeFromWorld();
							return;
						}
						// add a random velocity to the current x velocity
						this.xVel += -1+Math.random()*2;
						// add a random velocity to the current y velocity
						this.yVel += -0.5+Math.random();
						// clamp the velocities to prevent the bubbles
						// from going WAY too fast
						if(this.xVel > 10){this.xVel = 10;}
						if(this.yVel < -5){this.yVel = -5;}
						if(this.yVel > 10){this.yVel = 10;}
						// apply the new velocities to the entity transform
						trans.translation.y+=this.yVel*Time.dt;
						trans.translation.x+=this.xVel*Time.dt;
						// update the new transforms
						this.transformComponent.setUpdated();
					}
				};
				// show the goo canvas
				$('#goo').show();
				// start rendering the scene
				Game.doRender = true;
			};
		}
	}
	init();
});
