const rand = max=>Math.floor(Math.random()*max);
/*
    *************************
    ***** MAIN FUNCTION *****
    *************************
*/
export default function move(gameState){
    const board = gameState.board;
    const you = gameState.you
    const food = board.food.filter(pos => !(pos.x === (board.width-1)/2 && pos.y === (board.height-1)/2));
    let moveOnTurn = foodMethod(food, you.head, board);
    return {move: moveOnTurn[rand(moveOnTurn.length)]};
}
/*
    *****************************
    ***** FUNCTIONS TO CALL *****
    *****************************
*/
function foodMethod(food, head, board) {
    const closestFood = ()=> {
        let foodDis = food.map((element)=>{
            return (Math.abs(element.x-head.x)+Math.abs(element.y-head.y));
        });
        return food[foodDis.indexOf(Math.min(...foodDis))];
    }
    let target = closestFood();
    console.log(getDirection(target, head, board))
    return getDirection(target, head, board);
}
function getDirection(pos, head, board) { //get 
    let arr = [];
    console.log(pos)
    console.log(dirMap(pos, "down"))
    console.log(getSafe(dirMap(pos, "down"), board))
    if (pos.x < head.x) {
        arr.push("left");
    }
    if (pos.x > head.x) {
        arr.push("right");
    }
    if (pos.y < head.y) {
        arr.push("down");
    }
    if (pos.y > head.y) {
        arr.push("up");
    }
    return arr;
}
function getSafe(pos, board) {
    for (let i=0;i<board.snakes.length;i++) {
        const snake = board.snakes[i].body
        if (snake.some(obj => obj.x === pos.x && obj.y === pos.y)) {
            return false;
        }
    }
    return true;
}
function dirMap(element, dir) {
    if (dir=="up") {
        return {x:element.x, y:element.y+1};
    } else if (dir=="right") {
        return {x:element.x+1, y:element.y};
    } else if (dir=="down") {
        return {x:element.x, y:element.y-1};
    } else if (dir=="left") {
        return {x:element.x-1, y:element.y};
    }
    console.log("dirMap Broke");
    return element;
}