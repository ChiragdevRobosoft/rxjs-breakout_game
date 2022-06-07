import { gameSize } from "./constants";
import { Player, Ball, GameObject } from "./interfaces";

const empty = 0; // empty when the element is hit
const plyer = 1; // player element is blue
const bll = 2; // ball element is grey
const brick = 3; //normal dot element is silver

const bgColor: string = "background-color";
let val1: string;
const borderRadius: string = "border-radius";
let val2: string;

// create the element by passing the number as parameter
const createElem = (col) => {
  const elem = document.createElement("div"); //const elem = document.createElement("div");
  elem.classList.add("board");
  elem.style.display = "inline-block";
  elem.style.marginLeft = "10px";
  elem.style.height = "6px";
  elem.style.width = "6px";
  elem.style.setProperty(
    bgColor,
    (val1 =
      col === 0
        ? "white"
        : col === 1
        ? "cornflowerblue"
        : col === 2
        ? "gray"
        : "silver")
  );
  elem.style.setProperty(borderRadius, (val2 = col === bll ? "100%" : "0%"));
  return elem;
};

//Board rendering component
export const render = ([player, ball, bricks]: [
  Player,
  Ball,
  GameObject[]
]) => {
  const game = Array(gameSize)
    .fill(0)
    .map((e) => Array(gameSize).fill(0)); //2 dimensional array for rows and columns (making a matrix)
  game[player.x][player.y] = plyer; //add the player representation value to matrix using player x & y position
  game[ball.x][ball.y] = bll; //add the ball representation value to matrix using ball x & y position
  bricks.forEach((b) => (game[b.x][b.y] = brick)); //add the point element representation value to matrix with alternating.

  document.body.innerHTML = `Score: ${player.score} Lives: ${player.lives} <br/>`; //render the lives and score row
  game.forEach((r) => {
    //creating element based on matrix values
    const rowContainer = document.createElement("div");
    r.forEach((c) => rowContainer.appendChild(createElem(c)));
    document.body.appendChild(rowContainer);
  });
};
