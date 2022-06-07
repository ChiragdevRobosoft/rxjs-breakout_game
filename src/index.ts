console.clear();
import { fromEvent, of, interval, combineLatest, generate, noop } from "rxjs";
import {
  map,
  mergeMap,
  pluck,
  startWith,
  scan,
  toArray,
  takeWhile,
  tap,
} from "rxjs/operators";
import { gameSize } from "./constants";
import { Player, Ball, GameObject } from "./interfaces";
import { render } from "./html-renderer";

const createGameObject = (x, y) => ({ x, y });

/*
player element functionality:-
combineLatest - takes observables and returns an array of latest values of all observables when even one obs value is recieved
of - takes values and converts them into observable sequence
fromEvent is trigered when the button is pressed in the entire document
pipe is used to startwith no button press
pluck - takes values of key="code" in the event object
map gets an array of a player object and an keycode
*/
const player$ = combineLatest(
  of({
    ...createGameObject(gameSize - 2, gameSize / 2 - 1),
    score: 0,
    lives: 3,
  }),
  fromEvent(document, "keyup").pipe(startWith({ code: "" }), pluck("code"))
).pipe(
  map(
    ([player, key]) => (
      key === "ArrowLeft"
        ? (player.y -= 1)
        : key === "ArrowRight"
        ? (player.y += 1)
        : noop,
      player
    )
  )
);

/*
player element functionality:-
combineLatest - takes observables and returns an array of latest values of all observables when even one obs value is recieved
of - takes values and converts them into observable sequence,
here interval is used to trigeer ball after every 150ms
next ball movement is created in the map function
*/
const ball$ = combineLatest(
  of({ ...createGameObject(gameSize / 2, gameSize - 3), dirX: 1, dirY: 1 }),
  interval(150)
).pipe(
  map(
    ([ball, _]: [Ball, number]) => (
      (ball.dirX *= ball.x > 0 ? 1 : -1),
      (ball.dirY *= ball.y > 0 && ball.y < gameSize - 1 ? 1 : -1),
      (ball.x += 1 * ball.dirX),
      (ball.y -= 1 * ball.dirY),
      ball
    )
  )
);

const bricks$ = generate(
  1,
  (x) => x < 8,
  (x) => x + 1
).pipe(
  mergeMap((r) =>
    generate(
      r % 2 === 0 ? 1 : 0,
      (x) => x < gameSize,
      (x) => x + 2
    ).pipe(map((c) => createGameObject(r, c)))
  ),
  toArray()
);

const processGameCollisions = (
  _,
  [player, ball, bricks]: [Player, Ball, GameObject[]]
): [Player, Ball, GameObject[]] => (
  ((collidingBrickIndex) =>
    collidingBrickIndex > -1
      ? (bricks.splice(collidingBrickIndex, 1),
        (ball.dirX *= -1),
        player.score++)
      : noop)(bricks.findIndex((e) => e.x === ball.x && e.y === ball.y)),
  (ball.dirX *= player.x === ball.x && player.y === ball.y ? -1 : 1),
  ball.x > player.x ? (player.lives--, (ball.x = gameSize / 2 - 3)) : noop,
  [player, ball, bricks]
);

/*
observable and game working
combineLatest - takes observables and returns an array of latest values of all observables when even one obs value is recieved
pipe does ordered excution
scan is like execute which uses curr and acc and does the operation spexified with an initial value
here scan uses previous and current game states and based on collision updates the game
tap calls the render function
takeWhile keeps continuing emitting values until the given condition is false
*/
combineLatest(player$, ball$, bricks$)
  .pipe(
    scan<[Player, Ball, GameObject[]], [Player, Ball, GameObject[]]>(
      processGameCollisions
    ),
    tap(render),
    takeWhile(([player]: [Player, Ball, GameObject[]]) => player.lives > 0)
  )
  .subscribe();
