 var mon = document.getElementById("monitor");

    /* ThreeJS */

    var container = $("#canvas");
    var canvasWidth = container.width();
    var canvasHeight = container.height();

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, canvasWidth / canvasHeight, 0.1, 1000 );

    // this creates a 3d rendering context and
    // a canvas
    var renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setSize( canvasWidth, canvasHeight );
    renderer.setClearColor( 0x000000, 0 );

    // the canvas is part of the renderer as a HTML DOM
    // element and needs to be appended in the DOM
    container.get(0).appendChild( renderer.domElement );

    var geometry = new THREE.SphereGeometry( 2, 12, 12 );
    var material = new THREE.MeshBasicMaterial({
        color : 0x92ff38,
        wireframe : true,
        wireframeLinewidth: 2
    });
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    function render() {
        requestAnimationFrame( render );
        //cube.rotation.x += 0.02;
        cube.rotation.y += 0.008;
        renderer.render( scene, camera );
    }
    render();








 var input;
 var cursor;
 var hiddenInput;
 var content = [];
 var lastContent = "", targetContent = "";
 var inputLock = false;
 var autoWriteTimer;

 var isMobile, isIE;

 window.onload = function() {

     isMobile = navigator && navigator.platform && navigator.platform.match(/^(iPad|iPod|iPhone)$/);

     isIE = (navigator.appName == 'Microsoft Internet Explorer');

     input = document.getElementById('input');

     hiddenInput = document.getElementById('hiddenInput');
     hiddenInput.focus();

     cursor = document.createElement('cursor');
     cursor.setAttribute('class', 'blink');
     cursor.innerHTML = "|";

     if (!isMobile && !isIE) input.appendChild(cursor);

     function refresh() {

         inputLock = true;

         if (targetContent.length - lastContent.length == 0) return;

         var v = targetContent.substring(0, lastContent.length + 1);

         content = [];

         var blinkPadding = false;

         for (var i = 0; i < v.length; i++) {
             var l = v.charAt(i);

             var d = document.createElement('div');
             d.setAttribute('class', 'letterContainer');

             var d2 = document.createElement('div');

             var animClass = (i % 2 == 0) ? 'letterAnimTop' : 'letterAnimBottom';

             var letterClass = (lastContent.charAt(i) == l) ? 'letterStatic' : animClass;

             if (letterClass != 'letterStatic') blinkPadding = true;

             d2.setAttribute('class', letterClass);

             d.appendChild(d2);

             d2.innerHTML = l;
             content.push(d);
         }

         input.innerHTML = '';

         for (var i = 0; i < content.length; i++) {
             input.appendChild(content[i]);
         }

         cursor.style.paddingLeft = (blinkPadding) ? '22px' : '0';

         if (!isMobile && !isIE) input.appendChild(cursor);

         if (targetContent.length - lastContent.length > 1) setTimeout(refresh, 150);
         else inputLock = false;

         lastContent = v;
     }

     if (document.addEventListener) {

         document.addEventListener('touchstart', function(e) {
             clearInterval(autoWriteTimer);
             targetContent = lastContent;
         }, false);

         document.addEventListener('click', function(e) {
             clearInterval(autoWriteTimer);
             targetContent = lastContent;
             hiddenInput.focus();
         }, false);

         document.addEventListener('keydown', function(e){
             var key = e.keyCode || e.which;
             if (key === 13) {
                 sickSubmit();
             }
         });
         if (!isIE) {
             // Input event is buggy on IE, so don't bother
             // (http://msdn.microsoft.com/en-us/library/gg592978(v=vs.85).aspx#feedback)
             // We will use a timer instead (below)
             hiddenInput.addEventListener('input', function(e) {
                 e.preventDefault();
                 targetContent = hiddenInput.value;
                 if (!inputLock) refresh();

             }, false);
         } else {
             setInterval(function() {
                 targetContent = hiddenInput.value;

                 if (targetContent != lastContent && !inputLock) refresh();
             }, 100);
         }

     }

     hiddenInput.value = "";
 }


 function sickSubmit()
 {
    console.log('submit');
 }