export default function move(gameState){
    const rand = max=>Math.floor(Math.random()*max); //RNG
    const board = gameState["board"];
    const headPos = gameState["you"]["head"];
    const neckPos = gameState["you"]["body"][1];
    const food = board["food"];
    let moveOnTurn = "down"; //DEFAULT MOVE (mostly if no safe moves)
    /*
        ******************
        ***SAFETY LOGIC***
        ******************
    */
    let safeMoves = {
        up: "safe",
        right: "safe",
        down: "safe",
        left: "safe"
    }
    if (headPos.x==0) { // board boundaries
        safeMoves["left"] = "hazard";
    } else if (headPos.x==board.width-1) {
        safeMoves["right"] = "hazard";
    } 
    if (headPos.y==0) {
        safeMoves["down"] = "hazard";
    } else if (headPos.y==board.height-1) {
        safeMoves["up"] = "hazard";
    }
    const checkForSafe = (pos) => {
        // Loop through all snakes on the board
        for (const snake of board.snakes) {
            // Loop through each segment in the snake's body
            for (const segment of snake.body) {
                // Compare position values
                if (segment.x === pos.x && segment.y === pos.y) {
                    return true; // Found a match
                }
            }
        }
        return false; // No matches found, safe spot
    };
    const directions = {
        up:    { x: 0, y: -1 },
        down:  { x: 0, y: 1 },
        left:  { x: -1, y: 0 },
        right: { x: 1, y: 0 }
    };
    for (const [dirName, dirOffset] of Object.entries(directions)) {
        const newPos = {
            x: headPos.x + dirOffset.x,
            y: headPos.y + dirOffset.y
        };
    
        if (checkForSafe(newPos)) {
            safeMoves[dirName] = "hazard"; // Mark as unsafe 😵‍💫
        }
    }
    /*
        ************************
        ***GO TO CLOSEST FOOD***
        ************************
    */
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
    const foodPriority = ()=> { //set move priorities for food
        let priority = [];
        if (headPos.x<closestFood().x) { //possible x moves
            priority.push("right");
        } else if (headPos.x>closestFood().x) {
            priority.push("left");
        }
        if (headPos.y<closestFood.y) { //possible y moves
            priority.push("up");
        } else if (headPos.y>closestFood().y) {
            priority.push("down");
        }
        return priority;
    }
    let possibleMoves = foodPriority();
    for (let i of possibleMoves) {
        if (safeMoves[possibleMoves]=="hazard") {
            possibleMoves.splice(i, 1);
        }
    }
    if (possibleMoves.length>0) { // if food move
        moveOnTurn = possibleMoves[rand(possibleMoves.length)];
    } else { // else go random other way
        let keyList = Object.keys(safeMoves);
        moveOnTurn = keyList[rand(keyList.length)]
    }

    // return for response
    return {
        move:moveOnTurn,
        shout:"florvish lantridex wiplenq thosrevid yablorm neckftur plindoth zernibil quastum hirodel ravtech nitholpi churstend glonpax befalim quarsay doxmesh lornquiv retzrami zothidul paferglew vexlond pindlequy drifnort staldrex bormative serfion pludecth nexlofi asterbin."
    }
}