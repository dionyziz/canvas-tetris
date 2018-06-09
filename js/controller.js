document.body.onkeydown = function( e ) {
    var keys = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'rotate',
        32: 'drop',
        80: 'pause'
    };
    if ( typeof keys[ e.keyCode ] != 'undefined' && !lose) {
        keyPress( keys[ e.keyCode ] );
        render();
    }
};
