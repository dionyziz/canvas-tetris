var COLS = 10, ROWS = 20;
var board = [];
var shuffleList = [ 0, 1, 2, 3, 4, 5, 6 ];
var currentShuffleIndex = 0;
var lose;
var interval, setcolor;
var current; // current moving shape
var next1, next2, next3; // next moving shape (next3 -> next2 -> next1 -> current)
var currentId; // id of current moving shape
var next1Id, next2Id, next3Id; // id of next moving shape
var currentX, currentY; // position of current shape
var ghostCurrentX, ghostCurrentY; // position of ghost of current shape
var freezed; // is current shape settled on the board?
var score;
var pause = false;

// creates a new 4x4 shape in global variable 'next'
// 4x4 so as to cover the size when the shape is rotated
function newShape( init ) {

    if( init == true ) {
        next1Id = getNextId();
        next2Id = getNextId();
        next3Id = getNextId();
        var shape1 = shapes[ next1Id ];
        var shape2 = shapes[ next2Id ];
        var shape3 = shapes[ next3Id ];

        next1 = [];
        next2 = [];
        next3 = [];
        for ( var y = 0; y < 4; ++y ) {
            next1[ y ] = [];
            next2[ y ] = [];
            next3[ y ] = [];
            for ( var x = 0; x < 4; ++x ) {
                var i = 4 * y + x;
                if ( typeof shape1[ i ] != 'undefined' && shape1[ i ] ) {
                    next1[ y ][ x ] = next1Id + 1;
                }
                else {
                    next1[ y ][ x ] = 0;
                }
                if ( typeof shape2[ i ] != 'undefined' && shape2[ i ] ) {
                    next2[ y ][ x ] = next2Id + 1;
                }
                else {
                    next2[ y ][ x ] = 0;
                }
                if ( typeof shape3[ i ] != 'undefined' && shape3[ i ] ) {
                    next3[ y ][ x ] = next3Id + 1;
                }
                else {
                    next3[ y ][ x ] = 0;
                }
            }
        }
    }
    else {
        next3Id = getNextId();
        var shape = shapes[ next3Id ]; // maintain id for color filling

        next3 = [];
        for ( var y = 0; y < 4; ++y ) {
            next3[ y ] = [];
            for ( var x = 0; x < 4; ++x ) {
                var i = 4 * y + x;
                if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                    next3[ y ][ x ] = next3Id + 1;
                }
                else {
                    next3[ y ][ x ] = 0;
                }
            }
        }
    }
    drawNext();
}

// get id of next shape in shuffle list
function getNextId(){
    var index = currentShuffleIndex;
    if ( index == 0 ) {
        for (var i = shuffleList.length - 1; i > 0; i--) {
            var j = Math.floor( Math.random() * ( i + 1 ) );
            [ shuffleList[ i ], shuffleList[ j ] ] = [ shuffleList[ j ], shuffleList[ i ] ];
        }
        currentShuffleIndex += 1;
    }
    else if ( index == 6 ) {
        currentShuffleIndex = 0;
    }
    else {
        currentShuffleIndex += 1;
    }
    return shuffleList[ index ] * 4;
}

// move 'next' shape to 'current' shape
function moveToCurrent() {
    current = next1.slice(); // move next shape to current shape
    next1 = next2.slice();
    next2 = next3.slice();
    currentId = next1Id;
    next1Id = next2Id;
    next2Id = next3Id;
    freezed = false;
    // position where the shape will evolve
    currentX = ghostCurrentX = 5;
    currentY = ghostCurrentY = 0;
    newShape(false);
    while( pullDownGhost() ) {
        ++ghostCurrentY;
    }
}

// clears the board
function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

// keep the element moving down, creating new shapes and clearing lines
function tick() {
	if ( pause == false ){
	    if ( valid( 0, 1 ) ) {
	        ++currentY;
	    }
	    // if the element settled
	    else {
	        freeze();
	        valid(0, 1);
	        clearLines();
	        if (lose) {
	            return false;
	        }
	        moveToCurrent();
	    }
	}
}

// stop shape at its position and fix it to board
function freeze() {
    if( !checkLast() ){
        for ( var y = 0; y < 4; ++y ) {
            for ( var x = 0; x < 4; ++x ) {
                if ( current[ y ][ x ] ) {
                    board[ y + currentY ][ x + currentX ] = current[ y ][ x ];
                }
            }
        }
    }
    freezed = true;
    if( !lose ){
        var dropSound = new Audio( 'sound/block-drop.mp3' );
        dropSound.play();
    }
}

function checkLast(){
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if( current[ y ][ x ]){
                if( board[ y + currentY ][ x + currentX ] ) {
                    clearInterval (setcolor);
                    return true;
                }
            }
        }
    }
    return false;
}

// returns rotates the rotated shape 'current' perpendicularly anticlockwise
function rotate( current ) {
    var shape;
    var newCurrent = [];

    if( currentId % 4 == 3) {
        currentId -= 3;
    }
    else {
        currentId += 1;
    }

    shape = shapes[ currentId ];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                newCurrent[ y ][ x ] = currentId + 1;
            }
            else {
                newCurrent[ y ][ x ] = 0;
            }
        }
    }
    return newCurrent;
}

// check if any lines are filled and clear them
function clearLines() {
    for ( var y = ROWS - 1; y >= 0; --y ) {
        var rowFilled = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                rowFilled = false;
                break;
            }
        }
        if ( rowFilled ) {
            var clearSound = new Audio( 'sound/line-clear.mp3' );
            clearSound.volume = 0.3;
            clearSound.play();
            score = score + 1;
        	drawScore();
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            ++y;
        }
    }
}

function keyPress( key ) {
    if( pause == false ){
	    switch ( key ) {
	        case 'left':
	            if ( valid( -1 ) ) {
	                --currentX;
	                --ghostCurrentX;
	                ghostCurrentY = currentY;
	                while( pullDownGhost() ) {
	                    ++ghostCurrentY;
	                }
	            }
	            break;
	        case 'right':
	            if ( valid( 1 ) ) {
	                ++currentX;
	                ++ghostCurrentX;
	                ghostCurrentY = currentY;
	                while( pullDownGhost() ) {
	                    ++ghostCurrentY;
	                }
	            }
	            break;
	        case 'down':
	            if ( valid( 0, 1 ) ) {
	                ++currentY;
	            }
	            break;
	        case 'rotate':
	            var rotated = rotate( current );
	            var rotateSound = new Audio( 'sound/block-rotate.mp3' );
	            rotateSound.volume = 0.7
	            rotateSound.play();
	            if ( valid( 0, 0, rotated ) ) {
	                current = rotated;
	                ghostCurrentY = currentY;
	                while( pullDownGhost() ) {
	                    ++ghostCurrentY;
	                }
	            }
	            break;
	        case 'drop':
	            while( valid(0, 1) ) {
	                ++currentY;
	            }
	            tick();
	            break;
	    }
    }
    if( key == 'pause' ){
    	if ( pause == false ) pause = true;
    	else pause = false;
    }
}

function pullDownGhost( newCurrent ) {
    var ghostOffsetY = ghostCurrentY + 1;
    newCurrent = newCurrent || current;

    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + ghostOffsetY ] == 'undefined'
                  || typeof board[ y + ghostOffsetY ][ x + currentX ] == 'undefined'
                  || board[ y + ghostOffsetY ][ x + currentX ] ) {
                    return false;
                }
            }
        }
    }
    return true;
}

// checks if the resulting position of current shape will be feasible
function valid( offsetX, offsetY, newCurrent ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = currentX + offsetX;
    offsetY = currentY + offsetY;
    newCurrent = newCurrent || current;

    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( newCurrent[ y ][ x ] ) {
                if ( typeof board[ y + offsetY ] == 'undefined'
                  || typeof board[ y + offsetY ][ x + offsetX ] == 'undefined'
                  || board[ y + offsetY ][ x + offsetX ]
                  || x + offsetX < 0
                  || y + offsetY >= ROWS
                  || x + offsetX >= COLS ) {
                    if (offsetY == 1 && freezed) {
                        lose = true; // lose if the current shape is settled at the top most row
                        document.getElementById( 'playbutton' ).disabled = false;
                        gameOver();
                    }
                    return false;
                }
            }
        }
    }
    return true;
}

function playButtonClicked() {
    drawLine();
    newGame();
    document.getElementById( 'playbutton' ).disabled = true;
}

function newGame() {
	score = 0;
	drawScore();
    clearInterval( interval );
    setcolor = setInterval( render, 30 );
    init();
    newShape(true);
    moveToCurrent();
    lose = false;
    interval = setInterval( tick, 400 );
}
