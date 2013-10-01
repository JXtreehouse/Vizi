/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author paulirish / http://paulirish.com/
 */

/* Hacked-up version of Three.js FirstPerson controls for Vizi
 * 
 */

goog.provide('Vizi.FirstPersonControls');

Vizi.FirstPersonControls = function ( object, domElement ) {

	this.object = object;
	this.target = new THREE.Vector3( 0, 0, 0 );

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	this.movementSpeed = 1.0;
	this.lookSpeed = 1.0;

	this.lookVertical = true;
	this.autoForward = false;
	// this.invertVertical = false;

	this.activeLook = false;

	this.heightSpeed = false;
	this.heightCoef = 1.0;
	this.heightMin = 0.0;
	this.heightMax = 1.0;

	this.constrainVertical = false;
	this.verticalMin = 0;
	this.verticalMax = Math.PI;

	this.autoSpeedFactor = 0.0;

	this.mouseX = 0;
	this.mouseY = 0;

	this.lat = 0;
	this.lon = -90;
	this.phi = 0;
	this.theta = 0;

	this.moveForward = false;
	this.moveBackward = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.freeze = false;

	this.mouseDragOn = false;

	this.viewHalfX = 0;
	this.viewHalfY = 0;

	if ( this.domElement !== document ) {

		this.domElement.setAttribute( 'tabindex', -1 );

	}

	//

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;

		} else {

			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;

		}

	};

	this.onMouseDown = function ( event ) {

		if ( this.domElement !== document ) {

			this.domElement.focus();

		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;

			}

		}

		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}
		
		var position = new THREE.Vector3, 
		quaternion = new THREE.Quaternion, 
		scale = new THREE.Vector3;
		this.object.matrix.decompose(position, quaternion, scale);
		var rotation = new THREE.Euler;
		rotation.setFromQuaternion(quaternion);
		
		this.lon = THREE.Math.radToDeg(rotation.y);
		this.lat = THREE.Math.radToDeg(rotation.x);
		
		this.dragStartX = this.mouseX;
		this.dragStartY = this.mouseY;
		this.startLon = this.lon;
		this.startLat = this.lat;
		this.mouseDragOn = true;

	};

	this.onMouseUp = function ( event ) {

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {

			switch ( event.button ) {

				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;

			}

		}

		this.mouseDragOn = false;

	};

	this.onMouseMove = function ( event ) {

		if ( this.domElement === document ) {

			this.mouseX = event.pageX - this.viewHalfX;
			this.mouseY = event.pageY - this.viewHalfY;

		} else {

			this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;

		}

	};

	this.onKeyDown = function ( event ) {

		//event.preventDefault();

		switch ( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
			case 70: /*F*/ this.moveDown = true; break;

			case 81: /*Q*/ this.freeze = !this.freeze; break;

		}

	};

	this.onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
			case 70: /*F*/ this.moveDown = false; break;

		}

	};

	this.update = function( delta ) {

		this.startY = this.object.position.y;
		
		if ( this.freeze ) {

			return;

		}

		if ( this.heightSpeed ) {

			var y = THREE.Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;

			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );

		} else {

			this.autoSpeedFactor = 0.0;

		}

		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward || ( this.autoForward && !this.moveBackward ) ) 
			this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) 
			this.object.translateZ( actualMoveSpeed );

		this.object.position.y = this.startY;
		
		if ( this.moveLeft ) 
			this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) 
			this.object.translateX( actualMoveSpeed );

		if ( this.moveUp ) 
			this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) 
			this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;

		if ( !this.activeLook ) {

			actualLookSpeed = 0;

		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {

			verticalLookRatio = Math.PI / ( this.verticalMax - this.verticalMin );

		}

		var DRAG_DEAD_ZONE = 4;
		
		if (this.mouseDragOn) {
			var dlon = this.mouseX - this.dragStartX;
			if (Math.abs(dlon) < DRAG_DEAD_ZONE)
				dlon = 0;
			this.lon = this.startLon - dlon * this.lookSpeed;
			
			if (dlon != 0) {
				console.log("Longitude - delta: ", dlon, "value: ", this.lon)
			}
			
			if( this.lookVertical ) {
				var dlat = -(this.mouseY - this.dragStartY);
				if (Math.abs(dlat) < DRAG_DEAD_ZONE)
					dlat = 0;

				this.lat = this.startLat + dlat * this.lookSpeed * verticalLookRatio;

				if (dlat != 0) {
					console.log("Latitue - delta: ", dlat, "value: ", this.lat)
				}

			}
			
			this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
			this.phi = THREE.Math.degToRad( this.lat );

			if (this.phi != 0) {
				console.log("Phi: ", this.phi)
			}
	
			this.theta = THREE.Math.degToRad( this.lon );
	
			if ( this.constrainVertical ) {
	
				this.phi = THREE.Math.mapLinear( this.phi, 0, Math.PI, this.verticalMin, this.verticalMax );
	
			}
	
			var targetPosition = this.target,
				position = this.object.position;
	
			targetPosition.x = position.x -Math.sin( this.theta );
			targetPosition.y = position.y + Math.sin( this.phi );
			targetPosition.z = position.z -Math.cos( this.theta );
	
			this.object.lookAt( targetPosition );
		}
		
	};


	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, this.onMouseMove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.onMouseDown ), false );
	this.domElement.addEventListener( 'mouseup', bind( this, this.onMouseUp ), false );
	this.domElement.addEventListener( 'keydown', bind( this, this.onKeyDown ), false );
	this.domElement.addEventListener( 'keyup', bind( this, this.onKeyUp ), false );

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.handleResize();

};
