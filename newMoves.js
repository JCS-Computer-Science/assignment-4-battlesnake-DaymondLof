/*
    *************************
    ***** MAIN FUNCTION *****
    *************************
*/
export default function move(gameState){
    const board = gameState.board
    let food = board.food
    food = food.filter(pos => !(pos.x === (board.width-1)/2 && pos.y === (board.height-1)/2));
}
/*
    *****************************
    ***** FUNCTIONS TO CALL *****
    *****************************
*/
function foodMethod(food, head) {
    const closestFood = ()=> {
        let foodDis = food.map((element)=>{
            return (Math.abs(element.x-head.x)+Math.abs(element.y-head.y));
        });
        return Math.min(...foodDis);
    }
    let target = closestFood();
}
function getDirection(pos, head) { //get 
    let arr = [];
    if (pos.x < headPos.x) {
        arr += "left";
    }
    if (pos.x > headPos.x) {
        arr += "right";
    }
    if (pos.y < headPos.y) {
        arr += "down";
    }
    if (pos.y > headPos.y) {
        arr += "up";
    }
    return arr;
}
function getSafe(pos, board) {
    for (let i=0;i<board.snakes.length;i++) {
        const snake = board.snakes[i].body
        if (snake.some(obj => obj.x === pos.x && obj.y === pos.y)) {
            return true;
        }
    }
    return false;
}
function dirMap() {

}