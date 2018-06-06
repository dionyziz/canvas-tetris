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
    ctx.clearRect( 0, 0, W, H );

    ctx.strokeStyle = 'black';
    for ( var x = 0; x < COLS; ++x ) {
        for ( var y = 0; y < ROWS; ++y ) {
            if ( board[ y ][ x ] ) {
                ctx.fillStyle = colors[ board[ y ][ x ] - 1 ];
                drawBlock( x, y );
            }
        }
    }

    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                if( !checkLast() ) {
                    ctx.fillStyle = colors[ current[ y ][ x ] - 1 ];
                    drawBlock( currentX + x, currentY + y );
                    ctx.globalAlpha = 0.4;
                    drawBlock( ghostCurrentX + x, ghostCurrentY + y );
                    ctx.globalAlpha = 1.0;
                }
                else {
                    if( !lose ) {
                        drawLast();
                    }
                    return;
                }
            }
        }
    }
}

function drawLast() {
    ctx.strokeStyle = 'black';
    var row = 10;
    var cnt = 0;
    for ( var y = 3; y >= 0 ; --y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( current[ y ][ x ] ) {
                for (var r = 2; r>=0; --r ) {
                    if( !board[ r ][ x + currentX ] ){
                        if ( row > r + cnt ) {
                            row = r + cnt;
                        }
                        break;
                    }
                }
            }
        }
        if( row != 10){
            cnt++;
        }
    }
    if( row == 10){
        return;
    }

    var cnt = 0;
    var empty = 1;
    console.log("drawLast")
    for ( var y = 3; y >= 0; y-- ) {
        for ( var x = 3; x >= 0; x-- ) {
            if ( current[ y ][ x ] ) {
                if ( typeof board[ row - cnt ] == 'undefined'
                    || typeof board[ row - cnt ][ x + currentX ] == 'undefined'
                    || !board[ row - cnt][currentX + x] ) {
                        ctx.fillStyle = colors[ current[ y ][ x ] - 1 ];
                        board [ row - cnt ][ currentX + x ] = current [ y ][ x ];
                        drawBlock( currentX + x, row - cnt );
                        empty = 0;
                }
            }
        }
        if(!empty){
            cnt++;
        }
    }
}

function drawLine() {
    ctx.clearRect( 300, 0, 140, 600 );
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo( 300, 0 );
    ctx.lineTo( 300, 600 );
    ctx.stroke();
    ctx.font = '18.5pt Arial';
    ctx.fillStyle = 'black';
    ctx.fillText( 'next block', 315, 40 );
}

function drawNext() {
    ctx.clearRect( 301, 50, 139, 600 );
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( next[ y ][ x ] ) {
                ctx.fillStyle = colors[ next[ y ][ x ] - 1 ];
                drawBlock( 10.5 + x, 2 + y );
            }
        }
    }
}

function gameOver() {
    ctx.strokeStyle = 'black';
    for ( var x = 0; x < COLS; ++x ) {
        for ( var y = 0; y < ROWS; ++y ) {
            if ( board[ y ][ x ] ) {
                ctx.fillStyle = 'gray';
                drawBlock( x, y );
            }
        }
    }
    clearInterval( setcolor );
    ctx.fillStyle = 'black';
    ctx.globalAlpha = '0.1';
    ctx.fillRect( 0, 0, 440, 600 );
    ctx.fillStyle = 'white';
    ctx.globalAlpha = '1';
    ctx.font = '30px Arial';
    ctx.fillText( 'Game Over', 150, 300 );
}
