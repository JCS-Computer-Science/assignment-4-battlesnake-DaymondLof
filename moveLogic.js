export default function move(gameState){
    const board = gameState["board"];
    const headPos = gameState["you"]["head"];
    const neckPos = gameState["you"]["body"][1];
    const food = board["food"];
    /*
        ******************
        ***SAFETY LOGIC***
        ******************
    */
    let safeMoves = {
        up: true,
        right: true,
        down: true,
        left: true
    }
    if (headPos.x==0) { // board boundaries
        safeMoves["left"] = false;
    } else if (headPos.x==board.width-1) {
        safeMoves["right"] = false;
    } 
    if (headPos.y==0) {
        safeMoves["down"] = false;
    } else if (headPos.y==board.height-1) {
        safeMoves["up"] = false;
    }
    /*
        ************************
        ***GO TO CLOSEST FOOD***
        ************************
    */
    const closestFood = ()=> { // function for closest food
        let currentClosest = food[0];
        for (let i=1;i<food.length;i++) {
            let closestDis = currentClosest.x+currentClosest.y;
            let newDis = food[i].x+food[i].y;
            if (Math.abs(closestFood.x)+Math.abs(currentClosest.y)) {
                currentClosest = food[i];
            }
        }
        return currentClosest;
    }
    
    // move logic for food
    let moveOnTurn = "down";
    if (closestFood().x==headPos.x) {
        if (closestFood().y<headPos.y) {
            moveOnTurn = "down"
        } else {
            moveOnTurn = "up"
        }
    } else if (closestFood().x<headPos.x) {
        moveOnTurn = "left"
    } else {
        moveOnTurn = "right"
    }

    // return for response
    return {
        move:moveOnTurn,
        shout:"florvish lantridex wiplenq thosrevid yablorm neckftur plindoth zernibil quastum hirodel ravtech nitholpi churstend glonpax befalim quarsay doxmesh lornquiv retzrami zothidul paferglew vexlond pindlequy drifnort staldrex bormative serfion pludecth nexlofi asterbin."
    }
}