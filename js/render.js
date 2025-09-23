var canvas = document.getElementsByTagName( 'canvas' )[ 0 ];
var ctx = canvas.getContext( '2d' );
var W = 300, H = 600;
var BLOCK_W = W / COLS, BLOCK_H = H / ROWS;

// draw a single square at (x, y)
function drawBlock( x, y ) {
    ctx.fillRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1 , BLOCK_H - 1 );
    ctx.strokeRect( BLOCK_W * x, BLOCK_H * y, BLOCK_W - 1 , BLOCK_H - 1 );
}

// draws the board and the moving shape
function render() {
    // update animation state
    updateAnimation();
    
    ctx.clearRect( 0, 0, W, H );

    ctx.strokeStyle = 'black';
    for ( var x = 0; x < COLS; ++x ) {
        for ( var y = 0; y < ROWS; ++y ) {
            if ( board[ y ][ x ] ) {
                // check if this line is being animated
                var isAnimatingLine = false;
                for (var i = 0; i < animatingLines.length; i++) {
                    if (animatingLines[i] === y) {
                        isAnimatingLine = true;
                        break;
                    }
                }
                
                if (isAnimatingLine) {
                    // flash effect: alternate between white and original color
                    if (animationFrame % 2 === 0) {
                        ctx.fillStyle = 'white';
                    } else {
                        ctx.fillStyle = colors[ board[ y ][ x ] - 1 ];
                    }
                } else {
                    ctx.fillStyle = colors[ board[ y ][ x ] - 1 ];
                }
                drawBlock( x, y );
            }
        }
    }

    // only render current piece if not animating
    if (!isAnimating) {
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'black';
        for ( var y = 0; y < 4; ++y ) {
            for ( var x = 0; x < 4; ++x ) {
                if ( current[ y ][ x ] ) {
                    ctx.fillStyle = colors[ current[ y ][ x ] - 1 ];
                    drawBlock( currentX + x, currentY + y );
                }
            }
        }
    }
}