let turn = 0;
// Welcome to
// __________         __    __  .__                               __
// \______   \_____ _/  |__/  |_|  |   ____   ______ ____ _____  |  | __ ____
//  |    |  _/\__  \\   __\   __\  | _/ __ \ /  ___//    \\__  \ |  |/ // __ \
//  |    |   \ / __ \|  |  |  | |  |_\  ___/ \___ \|   |  \/ __ \|    <\  ___/
//  |________/(______/__|  |__| |____/\_____>______>___|__(______/__|__\\_____>
//
// This file can be a nice home for your Battlesnake logic and helper functions.
//
// To get you started we've included code to prevent your Battlesnake from moving backwards.
// For more info see docs.battlesnake.com
import express from 'express';
import move from './newMoves.js'

const app = express();
app.use(express.json());
const config = {
    apiversion: "1",
    author: "j*b and anti-huzz💔💔",  // TODO: Your Battlesnake Username
    color: "#FF22FF", // TODO: Choose color
    head: "trans-rights-scarf",  // TODO: Choose head, see https://play.battlesnake.com/customizations/ for options unlocked in your account
    tail: "replit-notmark"  // TODO: Choose tail, see https://play.battlesnake.com/customizations/ for options unlocked in your account
}
//TODO: respond to GET requests on "/" with the config object above
app.get("/", (req, res)=>{
  res.status(200).send(config);
})

//TODO: respond to POST requests on "/start". Your response itself is ignored, but must have status code "200"
//      the request body will contain objects representing the game instance, game board state, and your snake
//      https://docs.battlesnake.com/api/requests/start
app.post("/start", (req, res)=>{
  console.log("---------START----------")
  res.status(200);
})

//TODO: respond to POST requests on "/move". Your response should be an object with a "move" property and optionally
//      a "shout" property. The request body again contains objects representing the game state
//      https://docs.battlesnake.com/api/requests/move
app.post("/move", (req, res)=>{
  res.status(200).send(move(req.body));
})

//TODO: respond to POST requests on "/end", which signals the end of a game. Your response itself is ignored, 
//      but must have status code "200" the request body will contain objects representing the game
//      https://docs.battlesnake.com/api/requests/end
app.post("/end", (req, res)=>{
  console.log("---------END----------")
  res.status(200);
})

const host = '0.0.0.0';
const port = process.env.PORT || 8000;

app.listen(port, host, () => {
  console.log(`Running Battlesnake at http://${host}:${port}...`)
});