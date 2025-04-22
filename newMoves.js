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
    const isLongestSnake = ()=>{
        let current = board.snakes[0].length;
        for (let i=0;i<board.snakes.length;i++) {
            const snake = board.snakes[i];
            if (you.id!=snake.id && current<snake.length) {
                current = snake.length;
            }
        }
        if (you.length>current) {
            return true;
        }
        return false;
    }
    const board = removeTail(gameState.board);
    const food = board.food.filter(pos => !(pos.x === (board.width-1)/2 && pos.y === (board.height-1)/2));
    let headToHeadFilter = checkHeadToHead(["up","down","left","right"], you.head, board, you);
    let moveOnTurn = [];

    if (food.length>0 && (!isLongestSnake() || you.health<30)) {
        moveOnTurn = foodMethod(food, you.head, board, headToHeadFilter);
    }
    if (moveOnTurn.length==0) {
        moveOnTurn = tailMethod(you.head, board, headToHeadFilter, you);
    }
    if (moveOnTurn.length==0) {
        moveOnTurn = randomMethod(you.head, board, headToHeadFilter)
    }
    // send to server
    return {move: moveOnTurn[rand(moveOnTurn.length)]};
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
    return true;
}
function checkHeadToHead(moveOnTurn, head, board, you) {
    let movesToFilter = {
        safe: [],
        danger: []
    };

    const snakeHeads = () => {
        return board.snakes
            .filter(snake => snake.id !== you.id)
            .map(snake => snake.head);
    };

    const getEnemySnakeAt = (x, y) => {
        return board.snakes.find(snake => snake.head.x === x && snake.head.y === y);
    };

    const isFoodTile = (pos) => {
        return board.food.some(food => food.x === pos.x && food.y === pos.y);
    };

    const isSnakeHeadAdjacent = (pos) => {
        const adjacent = [
            { x: pos.x, y: pos.y + 1 },
            { x: pos.x, y: pos.y - 1 },
            { x: pos.x + 1, y: pos.y },
            { x: pos.x - 1, y: pos.y },
        ];
        return adjacent.some(adj =>
            snakeHeads().some(snake => snake.x === adj.x && snake.y === adj.y)
        );
    };

    const foodMoves = [];

    for (let i = 0; i < moveOnTurn.length; i++) {
        const move = moveOnTurn[i];
        const pos = nextMove(move, head);

        const isDanger = isSnakeHeadAdjacent(pos);
        const isFood = isFoodTile(pos);
        const trulySafe = getSafe(pos, board);

        if (isFood) {
            foodMoves.push({ move, pos });
        }

        if (isDanger) {
            if (!movesToFilter.danger.includes(move)) {
                movesToFilter.danger.push(move);
            }
        } else if (trulySafe) {
            if (!movesToFilter.safe.includes(move)) {
                movesToFilter.safe.push(move);
            }
        } else {
            if (!movesToFilter.danger.includes(move)) {
                movesToFilter.danger.push(move);
            }
        }
    }

    // Override: if every food move is a bait trap, move them all to danger
    if (
        foodMoves.length > 0 &&
        foodMoves.every(({ pos }) => isSnakeHeadAdjacent(pos))
    ) {
        for (const { move } of foodMoves) {
            if (!movesToFilter.danger.includes(move)) {
                movesToFilter.danger.push(move);
            }
            const index = movesToFilter.safe.indexOf(move);
            if (index !== -1) {
                movesToFilter.safe.splice(index, 1);
            }
        }
    }

    // Final override: head-to-head fallback if no safe options exist
    if (movesToFilter.safe.length === 0) {
        for (const move of movesToFilter.danger) {
            const pos = nextMove(move, head);
            const adjacent = [
                { x: pos.x, y: pos.y + 1 },
                { x: pos.x, y: pos.y - 1 },
                { x: pos.x + 1, y: pos.y },
                { x: pos.x - 1, y: pos.y },
            ];

            const canWinClash = adjacent.some(adj => {
                const enemy = getEnemySnakeAt(adj.x, adj.y);
                return enemy && enemy.length < you.length;
            });

            if (canWinClash) {
                movesToFilter.safe.push(move);
            }
        }

        // Clean up danger list
        movesToFilter.danger = movesToFilter.danger.filter(move => !movesToFilter.safe.includes(move));
    }

    // Final decision
    if (movesToFilter.safe.length > 0) {
        moveOnTurn = movesToFilter.safe;
    }

    console.log("Safe/Danger:", movesToFilter);
    console.log("Final Move:", moveOnTurn);
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