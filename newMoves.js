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
    const board = removeTail(gameState.board);
    const food = board.food.filter(pos => !(pos.x === (board.width-1)/2 && pos.y === (board.height-1)/2));
    let moveOnTurn = [];

    if (food.length>0) {
        moveOnTurn = foodMethod(food, you.head, board);
    }
    if (moveOnTurn.length==0) {
        moveOnTurn = randomMethod(you.head, board)
    }
    moveOnTurn = checkHeadToHead(moveOnTurn, you.head, board, you);
    // send to server
    return {move: moveOnTurn[rand(moveOnTurn.length)]};
}
/*
    *******************
    ***** METHODS *****
    *******************
*/
function foodMethod(food, head, board) {
    const closestFood = ()=> {
        let foodDis = food.map((element)=>{
            return (Math.abs(element.x-head.x)+Math.abs(element.y-head.y));
        });
        return food[foodDis.indexOf(Math.min(...foodDis))];
    }
    let target = closestFood();
    return getDirection(target, head, board);
}
function randomMethod(head, board) {
    let randMoves = [];
    if (getSafe({x:head.x-1, y:head.y}, board)) {
        randMoves.push("left")
    }
    if (getSafe({x:head.x+1, y:head.y}, board)) {
        randMoves.push("right");
    }
    if (getSafe({x:head.x, y:head.y-1}, board)) {
        randMoves.push("down");
    }
    if (getSafe({x:head.x, y:head.y+1}, board)) {
        randMoves.push("up");
    }
    return randMoves;
}
/*
    ***************************
    ***** OTHER FUNCTIONS *****
    ***************************
*/
function getDirection(pos, head, board) { //get 
    let arr = [];
    if (pos.x < head.x && getSafe({x:head.x-1, y:head.y}, board)) {
        arr.push("left");
    }
    if (pos.x > head.x && getSafe({x:head.x+1, y:head.y}, board)) {
        arr.push("right");
    }
    if (pos.y < head.y && getSafe({x:head.x, y:head.y-1}, board)) {
        arr.push("down");
    }
    if (pos.y > head.y && getSafe({x:head.x, y:head.y+1}, board)) {
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
        safe:[],
        danger:[]
    };
    const snakeHeads = (pos)=>{
        if (!pos) {
            let arr = [];
            for (const snake of board.snakes) {
                if (snake.id!=you.id) {
                    arr.push(snake.head);
                }
            }
            return arr;
        } else {

        }
    }
    for (let i=0;i<moveOnTurn.length;i++) {
        const pos = nextMove(moveOnTurn[i], head);
        const {x,y} = pos;
        const adjacent = [
            { x, y: y + 1 },
            { x, y: y - 1 },
            { x: x + 1, y },
            { x: x - 1, y },
        ];
        for (let j=0;j<adjacent.length;j++) {
            if (snakeHeads().some(obj=>obj.x===adjacent[j].x && obj.y===adjacent[j].y)) {
                movesToFilter.danger.push(moveOnTurn[i]);
                console.log("DANGER")
            } else if (!movesToFilter.safe.includes(moveOnTurn[i])) {
                movesToFilter.safe.push(moveOnTurn[i]);
            }
        }
    }
    if (movesToFilter.safe!=[]) {
        moveOnTurn = movesToFilter.safe;
    }
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