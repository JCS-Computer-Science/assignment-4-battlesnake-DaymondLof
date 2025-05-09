const rand = max=>Math.floor(Math.random()*max);
/*
    *************************
    ***** MAIN FUNCTION *****
    *************************
*/
export default function move(gameState){
    const you = gameState.you
    const turn = gameState.turn;
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
    
        return longest || you;
    }; 
    const isInHazard = (target) => {
        const hazards = gameState.board.hazards;
        return hazards.some(hazard => hazard.x === target.x && hazard.y === target.y);
    };   
    const board = gameState.board
    const food = board.food;
    // const food = board.food.filter(pos => !(pos.x === (board.width-1)/2 && pos.y === (board.height-1)/2)); //removes middle food
    let moveOnTurn = [];
    let method;

    const enemyLongest = longestEnemySnake();
    const isLongest = !enemyLongest || you.length > enemyLongest.length+2;
    const isLongestMoreAggressive = !enemyLongest || you.length > enemyLongest.length;

    let headToHeadFilter = ["up","down","left","right"];
    //flood fill
    headToHeadFilter = handleFill(headToHeadFilter, you.head, board);
    //avoid head to heads
    headToHeadFilter = checkHeadToHead(headToHeadFilter, you.head, board, you);
    
    if (food.length > 0 && (!isLongestMoreAggressive || you.health < 30) && moveOnTurn.length==0) {
        moveOnTurn = foodMethod(food, you.head, board, headToHeadFilter, you);
        method = "Food";
    }
    if (isInHazard(you.head)==true && moveOnTurn.length==0) {
        moveOnTurn = midMethod(you.head, board, headToHeadFilter);
        method = "Huzz";
    }
    if (isLongest && gameState.game.map == "standard") {
        moveOnTurn = chaseMethod(you.head, board, headToHeadFilter, enemyLongest.head);
        method = "Hunt";
    }
    if (moveOnTurn.length==0 && !isInHazard(you.body[you.body.length - 1]) && gameState.game.map!="snail_mode") {
        moveOnTurn = tailMethod(you.head, board, headToHeadFilter, you);
        method = "Tail";
    }
    if (moveOnTurn.length==0) {
        moveOnTurn = midMethod(you.head, board, headToHeadFilter); //hazard and this do the same thing rn
        method = "Midd"
    }
    if (moveOnTurn.length==0) {
        moveOnTurn = randomMethod(you.head, board, headToHeadFilter, you);
        method = "Rand";
    }
    // send to server
    let chosenMove = moveOnTurn[rand(moveOnTurn.length)];
    console.log(
        '\x1b[91m%s\x1b[0m \x1b[34m%s\x1b[0m \x1b[32m%s\x1b[0m \x1b[33m%s\x1b[0m',
        `${turn}:`,  // Red
        `${method}`,  // Blue
        `[${moveOnTurn}]`,  // Green
        `${chosenMove}`  // Yellow
    );
    
    return {move: chosenMove};
}
/*
    *******************
    ***** METHODS *****
    *******************
*/
function foodMethod(food, head, board, headToHeadFilter, you) {
    const closestFood = (foodList, selectedHead = head) => {
        if (foodList.length === 0) return undefined;

        let foodDis = foodList.map((element) => {
            return Math.abs(element.x - selectedHead.x) + Math.abs(element.y - selectedHead.y);
        });

        let minIndex = foodDis.indexOf(Math.min(...foodDis));
        if (minIndex === -1) return undefined;

        return foodList[minIndex];
    };

    // 1. Filter out food closer to other snakes
    let filteredFood = [...food];
    for (const snake of board.snakes) {
        if (snake.id !== you.id) {
            let closest = closestFood(filteredFood, snake.head);
            if (closest) {
                let snakeDistance = getDistance(snake.head, closest) - 1;
                let youDistance = getDistance(you.head, closest);

                if (youDistance >= snakeDistance) {
                    filteredFood = filteredFood.filter(pos => pos.x !== closest.x || pos.y !== closest.y);
                }
            }
        }
    }

    // 2. Filter out hazards, keep both safe and full sets
    const hazards = board.hazards;
    const safeFood = filteredFood.filter(food => !hazards.some(h => h.x === food.x && h.y === food.y));

    // 3. If no safe food, fallback to hazard food if health permits
    if (safeFood.length === 0) {
        const fallback = closestFood(filteredFood);
        if (fallback) {
            const distanceToFood = getDistance(you.head, fallback);
            const canSurviveHazard = distanceToFood <= Math.floor(you.health / 15);
            if (canSurviveHazard) {
                return getDirection(fallback, head, board, headToHeadFilter);
            }
        }
        // 4. No food options
        return [];
    }

    // Use closest safe food
    const target = closestFood(safeFood);
    return getDirection(target, head, board, headToHeadFilter);
}

function randomMethod(head, board, headToHeadFilter, you) {
    let randMoves = [];
    const isHazard = dir=> {
        let newPos = nextMove(dir, head);
        if (board.hazards.some(haz => haz.x === newPos.x && haz.y === newPos.y)) {
            return false;
        }
        return true;
    }
    if (getSafe({x:head.x-1, y:head.y}, board) && headToHeadFilter.includes("left") && isHazard("left")) {
        randMoves.push("left")
    }
    if (getSafe({x:head.x+1, y:head.y}, board) && headToHeadFilter.includes("right") && isHazard("right")) {
        randMoves.push("right");
    }
    if (getSafe({x:head.x, y:head.y-1}, board) && headToHeadFilter.includes("down") && isHazard("down")) {
        randMoves.push("down");
    }
    if (getSafe({x:head.x, y:head.y+1}, board) && headToHeadFilter.includes("up") && isHazard("up")) {
        randMoves.push("up");
    }
    if (randMoves.length==0) {
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
    }
    return randMoves;
}
function tailMethod(head, board, headToHeadFilter, you) {
    const tail = you.body[you.length-1];
    return getDirection(tail, head, board, headToHeadFilter);
}
function chaseMethod(head, board, headToHeadFilter, longestSnakeHead) {
    const target = longestSnakeHead;
    return getDirection(target, head, board, headToHeadFilter);
}
function midMethod(head, board, headToHeadFilter) {
    let posArr = [];
    for (const dir of headToHeadFilter) {
        const pos = nextMove(dir, head);
        if (!board.hazards.some(h => h.x === pos.x && h.y === pos.y)) {
            posArr.push(dir)
        }
    }
    if (posArr.length>0) {
        return posArr;
    } else {
        const target = {x:(board.width+1)/2, y:(board.height+1)/2};
        return getDirection(target, head, board, headToHeadFilter);
    }
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
    const { x, y } = pos;

    if (x < 0 || x >= board.width || y < 0 || y >= board.height) {
        return false;
    }

    for (let i = 0; i < board.snakes.length; i++) {
        const snake = board.snakes[i];
        const headX = snake.head.x;
        const headY = snake.head.y;

        // Check if the snake's head is adjacent to any food
        const adjacentToHead = [
            { x: headX, y: headY + 1 },
            { x: headX, y: headY - 1 },
            { x: headX + 1, y: headY },
            { x: headX - 1, y: headY },
        ];

        for (const dir of adjacentToHead) {
            if (board.food.some(f => f.x === dir.x && f.y === dir.y)) {
                // If head is adjacent to food, the tail cannot be considered safe
                const tail = snake.body[snake.body.length - 1];
                if (pos.x === tail.x && pos.y === tail.y) {
                    return false;
                }
            }
        }

        // Check if position overlaps any snake body part (excluding tails)
        for (let j = 0; j < snake.body.length - 1; j++) {
            const part = snake.body[j];
            if (part.x === x && part.y === y) {
                return false;
            }
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
function handleFill(filter, head, board) {
    let fills = [];
    for (let i=0;i<filter.length;i++) {
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
    let bigger = Math.max(...fills);
    for (let j=0;j<filter.length;j++) {
        if (fills[j]==bigger) {
            newMoves.push(filter[j]);
        }
    }
    return newMoves;
}
function getDistance(snake, target) {
    return Math.abs(snake.x-target.x)+Math.abs(snake.y-target.y);
}