export default function move(gameState){
    const rand = max=>Math.floor(Math.random()*max); //RNG
    let board = gameState["board"];
    const headPos = gameState["you"]["head"];
    const neckPos = gameState["you"]["body"][1];
    const me = gameState["you"]
    let food = board["food"];
    const tail = me.body[me.body.length-1];
    let moveOnTurn = "down"; //DEFAULT MOVE (mostly if no safe moves)
    let foodMoves = []; //move direction towards food (handled later)
    let tailMoves = []; //handle later
    /*
        ******************
        ***SAFETY LOGIC***
        ******************
    */
    let safeMoves = ["up","right","down","left"];

    for (let i=0;i<board.snakes.length; i++) {
        if (board.snakes[i].name=="daymondlof") {
            board.snakes[i].body.pop();
        }
    }
    const isNotLongestSnake = ()=> {
        for (let i=0; i<board.snakes.length; i++) {
            if (me["length"]>board.snakes[i]["length"]) {
                return false;
            }
        }
        return true;
    }
    //CHECK FOR BOARD BOUNDARIES
    if (headPos.y==board.height-1) { //up
        safeMoves.splice(safeMoves.indexOf("up"), 1);
    }
    if (headPos.x==board.width-1) { //right
        safeMoves.splice(safeMoves.indexOf("right"), 1);
    }
    if (headPos.y==0) { //down
        safeMoves.splice(safeMoves.indexOf("down"), 1);
    }
    if (headPos.x==0) { //down
        safeMoves.splice(safeMoves.indexOf("left"), 1);
    }

    const checkForHazard = (pos)=>{
        for (let i=0;i<board.snakes.length;i++) {
            const snake = board.snakes[i].body
            if (snake.some(obj => obj.x === pos.x && obj.y === pos.y)) {
                return true;
            }
        }
        return false;
    }
    //CHECK FOR SNAKE BODY
    if (checkForHazard({x:headPos.x, y:headPos.y+1})) { // up
        safeMoves.splice(safeMoves.indexOf("up"), 1);
    }
    if (checkForHazard({x:headPos.x+1, y:headPos.y})) { // right
        safeMoves.splice(safeMoves.indexOf("right"), 1);
    }
    if (checkForHazard({x:headPos.x, y:headPos.y-1})) { // down
        safeMoves.splice(safeMoves.indexOf("down"), 1);
    }
    if (checkForHazard({x:headPos.x-1, y:headPos.y})) { // left
        safeMoves.splice(safeMoves.indexOf("left"), 1);
    }
    /*
        ************************
        ***GO TO CLOSEST FOOD***
        ************************
    */
    const midWidth = (board.width-1)/2
    const midHeight = (board.height-1)/2
    food = food.filter(pos => !(pos.x === midWidth && pos.y === midHeight)); //delete food in middle (or else you die in head to head)

    if ((me.health<20 || isNotLongestSnake()) && food.length>0) {
        const closestFood = ()=> { // function for closest food
           let currentClosest = food[0];
           for (let i=1;i<food.length;i++) {
               let currentDis = Math.abs(currentClosest.x-headPos.x)+Math.abs(currentClosest.y-headPos.y);
               let newDis = Math.abs(food[i].x-headPos.x)+Math.abs(food[i].y-headPos.y);
               if (newDis<currentDis) {
                   currentClosest = food[i];
               }
           }
           return currentClosest;
       }
       let chosenFood = closestFood();
       //FOOD DIRECTIONS
       if (chosenFood.x>headPos.x) { //right
           foodMoves.push("right");
       } else if (chosenFood.x<headPos.x) { //left
           foodMoves.push("left");
       }
       if (chosenFood.y>headPos.y) { //up
           foodMoves.push("up");
       } else if (chosenFood.y<headPos.y) { //down
           foodMoves.push("down");
        }
        for (let i=0;i<foodMoves.length;i++) {
            if (!safeMoves.includes(foodMoves[i])) { //if food direction isnt safe
                foodMoves.splice(i, 1);
            }
        }
   } else {
        /*  
            ****************
            ***CHASE TAIL***
            ****************
        */
        //go to tail
        if (tail.x>headPos.x) { //right
            tailMoves.push("right");
        } else if (tail.x<headPos.x) { //left
            tailMoves.push("left");
        }
        if (tail.y>headPos.y) { //up
            tailMoves.push("up");
        } else if (tail.y<headPos.y) { //down
            tailMoves.push("down");
        }
        for (let i=0;i<tailMoves.length;i++) {
            if (!safeMoves.includes(tailMoves[i])) { //if tail direction isnt safe
                tailMoves.splice(i, 1);
            }
        }
   }
    /*
        **********************
        ***FINAL MOVE LOGIC***
        **********************
    */
    if (foodMoves.length>0) { // random dir towards food (if there is a safe one)
        moveOnTurn = foodMoves[rand(foodMoves.length)];
        console.log(`{${foodMoves}}, ${moveOnTurn}, Food Method`);
    } else if (tailMoves.length>0) {
        moveOnTurn = tailMoves[rand(tailMoves.length)]
        console.log(`{${tailMoves}}, ${moveOnTurn}, Tail Method`);
    } else if (safeMoves.length>0){ // else go other random dir
        moveOnTurn = safeMoves[rand(safeMoves.length)];
        console.log(`{${safeMoves}}, ${moveOnTurn}, Random Method`);
    }
    // return for response
    return {
        move:moveOnTurn,
        shout:"florvish lantridex wiplenq thosrevid yablorm neckftur plindoth zernibil quastum hirodel ravtech nitholpi churstend glonpax befalim quarsay doxmesh lornquiv retzrami zothidul paferglew vexlond pindlequy drifnort staldrex bormative serfion pludecth nexlofi asterbin."
    }
}