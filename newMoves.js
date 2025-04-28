const rand = max=>Math.floor(Math.random()*max);
/*
    *************************
    ***** MAIN FUNCTION *****
    *************************
*/
export default function move(gameState){
    const you = gameState.you
    const removeTail = (board)=>{
        for (let i=0; i<board.snakes.length;i++) {
            const snake = board.snakes[i];
            if (snake.id==you.id) {
                board.snakes[i].body.pop();
            }
        }
        return board;
    }
    const longestEnemySnake = () => {
        if (!board || !board.snakes || board.snakes.length === 0) {
            return you;
        }

        let longest = null;
        for (let i = 0; i < board.snakes.length; i++) {
            const snake = board.snakes[i];
            if (snake.id !== you.id) {
                if (!longest || snake.length > longest.length) {
                    longest = snake;
                }
            }
        }
    
        return longest;
    };
    const board = removeTail(gameState.board);
    const food = board.food;
    // const food = board.food.filter(pos => !(pos.x === (board.width-1)/2 && pos.y === (board.height-1)/2));

    //flood fill
    let headToHeadFilter = handleFill(["up","down","left","right"], you.head, board);
    //avoid head to heads
    headToHeadFilter = checkHeadToHead(headToHeadFilter, you.head, board, you);
    

    let moveOnTurn = [];
    let method;

    const enemyLongest = longestEnemySnake();
    const isLongest = !enemyLongest || you.length > enemyLongest.length+3;

    //CHANGE THESE TO PRIOTIZE HUNT IF SNAKE IS LONGEST *****
    if (isLongest && you.health>30) {
        moveOnTurn = chaseLongestSnakeMethod(you.head, board, headToHeadFilter, enemyLongest.head);
        method = "Hunt";
    }
    if (food.length > 0 && (!isLongest || you.health < 30) && moveOnTurn.length==0) {
        moveOnTurn = foodMethod(food, you.head, board, headToHeadFilter);
        method = "Food";
    }
    if (moveOnTurn.length==0) {
        moveOnTurn = tailMethod(you.head, board, headToHeadFilter, you);
        method = "Tail";
    }
    if (moveOnTurn.length==0) {
        moveOnTurn = randomMethod(you.head, board, headToHeadFilter);
        method = "Rand";
    }
    // send to server
    let chosenMove = moveOnTurn[rand(moveOnTurn.length)];
    console.log(
        '\x1b[34m%s\x1b[0m \x1b[32m%s\x1b[0m \x1b[33m%s\x1b[0m',
        `${method}`,
        `[${moveOnTurn}]`, 
        `${chosenMove}`
    );
    return {move: chosenMove};
}
/*
    *******************
    ***** METHODS *****
    *******************
*/
function foodMethod(food, head, board, headToHeadFilter) {
    const closestFood = ()=> {
        let foodDis = food.map((element)=>{
            return (Math.abs(element.x-head.x)+Math.abs(element.y-head.y));
        });
        return food[foodDis.indexOf(Math.min(...foodDis))];
    }
    let target = closestFood();
    return getDirection(target, head, board, headToHeadFilter);
}
function randomMethod(head, board, headToHeadFilter) {
    let randMoves = [];
    if (getSafe({x:head.x-1, y:head.y}, board) && headToHeadFilter.includes("left")) {
        randMoves.push("left")
    }
    if (getSafe({x:head.x+1, y:head.y}, board) && headToHeadFilter.includes("right")) {
        randMoves.push("right");
    }
    if (getSafe({x:head.x, y:head.y-1}, board) && headToHeadFilter.includes("down")) {
        randMoves.push("down");
    }
    if (getSafe({x:head.x, y:head.y+1}, board) && headToHeadFilter.includes("up")) {
        randMoves.push("up");
    }
    return randMoves;
}
function tailMethod(head, board, headToHeadFilter, you) {
    const tail = you.body[you.length-1];
    return getDirection(tail, head, board, headToHeadFilter);
}
function chaseLongestSnakeMethod(head, board, headToHeadFilter, longestSnakeHead) {
    const target = longestSnakeHead;
    return getDirection(target, head, board, headToHeadFilter);
}
/*
    ***************************
    ***** OTHER FUNCTIONS *****
    ***************************
*/
function getDirection(pos, head, board, headToHeadFilter) { //get 
    let arr = [];
    if (pos.x < head.x && getSafe({x:head.x-1, y:head.y}, board) && headToHeadFilter.includes("left")) {
        arr.push("left");
    }
    if (pos.x > head.x && getSafe({x:head.x+1, y:head.y}, board) && headToHeadFilter.includes("right")) {
        arr.push("right");
    }
    if (pos.y < head.y && getSafe({x:head.x, y:head.y-1}, board) && headToHeadFilter.includes("down")) {
        arr.push("down");
    }
    if (pos.y > head.y && getSafe({x:head.x, y:head.y+1}, board) && headToHeadFilter.includes("up")) {
        arr.push("up");
    }
    return arr;
}
function getSafe(pos, board) {
    const {x, y} = pos;
    if (x<0 || x>board.width-1 || y<0 || y>board.height-1) {
        return false;
    }
    for (let i=0;i<board.snakes.length;i++) {
        const snake = board.snakes[i];
        for (let j=0; j<snake.body.length; j++) {
            const part = snake.body[j];
            if (part["x"]==x && part["y"]==y) {
                return false;
            }
        }
    }
    for (let i=0;i<board.hazards.length;i++) {
        const hazard = board.hazards[i];
        if (hazard["x"]==x && hazard["y"]==y) {
            return false;
        }
    }
    return true;
}
function checkHeadToHead(moveOnTurn, head, board, you) {
    let movesToFilter = {
        safe: [],
        danger: []
    };

    const snakeHeads = () => {
        let arr = [];
        for (const snake of board.snakes) {
            if (snake.id !== you.id) {
                arr.push({pos:snake.head, length:snake.length});
            }
        }
        return arr;
    };

    for (let i = 0; i < moveOnTurn.length; i++) {
        const pos = nextMove(moveOnTurn[i], head);
        const { x, y } = pos;

        const adjacent = [
            { x, y: y + 1 },
            { x, y: y - 1 },
            { x: x + 1, y },
            { x: x - 1, y },
        ];

        let isDanger = adjacent.some(adj =>
            snakeHeads().some(snake => 
                snake.pos.x === adj.x && 
                snake.pos.y === adj.y && 
                snake.length >= you.length //only be danger if snake is equal or longer in length
            )
        );
        if (isDanger || !getSafe(pos, board)) {
            if (!movesToFilter.danger.includes(moveOnTurn[i])) {
                movesToFilter.danger.push(moveOnTurn[i]);
            }
        } else {
            if (!movesToFilter.safe.includes(moveOnTurn[i])) {
                movesToFilter.safe.push(moveOnTurn[i]);
            }
        }
    }

    if (movesToFilter.safe.length > 0) {
        moveOnTurn = movesToFilter.safe;
    }

    // console.log(movesToFilter);
    // console.log(moveOnTurn);
    return moveOnTurn;
}
function nextMove(moveOnTurn, head) {
    let {x,y} = head;
    if (moveOnTurn=="up") {
        return {x:x, y:y+1};
    } else if (moveOnTurn=="down") {
        return {x:x, y:y-1};
    } else if (moveOnTurn=="right") {
        return {x:x+1, y:y};
    } else if (moveOnTurn=="left") {
        return {x:x-1, y:y};
    }
}
function handleFill(filter, head, board, snake) {
    let fills = [];
    for (let i = 0; i < filter.length; i++) {
        let boardVisit = [];
        let pos = nextMove(filter[i], head);
        fills.push(floodFill(pos, board));
        
        function floodFill(pos, board) {
            if (boardVisit.some(obj => obj.x === pos.x && obj.y === pos.y) || !getSafe(pos, board)) {
                return 0;
            } else {
                boardVisit.push({ x: pos.x, y: pos.y });
                let count = 1;
                const directions = [
                    { x: 0, y: -1 },
                    { x: 0, y: 1 },
                    { x: -1, y: 0 },
                    { x: 1, y: 0 }
                ];
                for (let dir of directions) {
                    const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
                    count += floodFill(newPos, board, boardVisit);
                }
                return count;
            }
        }
    }

    let newMoves = [];
    let biggestFill = Math.max(...fills);

    for (let j = 0; j < filter.length; j++) {
        if (fills[j] < biggestFill) continue; // Only keep moves with maximum fill
        
        let simulatedSnake = simulateMove(filter[j], snake);
        console.log(simulatedSnake)
        let bounds = getBounds(simulatedSnake.body.slice(0, -1)); // Exclude tail

        let boundingArea = (bounds.maxX - bounds.minX + 1) * (bounds.maxY - bounds.minY + 1);

        if (boundingArea > fills[j]) {
            newMoves.push(filter[j]);
        }
    }

    return newMoves.length > 0 ? newMoves : filter; // Fallback if none pass
}

// Helper function to simulate moving the snake
function simulateMove(snake, moveOnTurn) {
    let newHead = nextMove(moveOnTurn, snake[0]);
    let newSnake = [newHead, ...snake.slice(0, -1)]; // move head, shift body
    return newSnake;
}

// Helper function to get bounding box of snake body
function getBounds(body) {
    let minX = Math.min(...body.map(p => p.x));
    let maxX = Math.max(...body.map(p => p.x));
    let minY = Math.min(...body.map(p => p.y));
    let maxY = Math.max(...body.map(p => p.y));
    return { minX, maxX, minY, maxY };
}