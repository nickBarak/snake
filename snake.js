
const pos = [0, 0];
let dir = 0;
const food = [7, 7];
let score = 0;
const trail = [[0, 0]];
const _ = process.stdout.write.bind(process.stdout);
const hideCursor = () => _('\033[?25l');
const showCursor = () =>_('\033[25h');
const placeCursor = (loc=pos) => _('\033[' + loc[1] + ';' + loc[0] + 'H');
const clear = () => _('\033[2J');

const init = () => {
	hideCursor();
	placeCursor([0, 0]);
	clear();
}

init();

const amIInBounds = () => {
	if (pos[0] < 0 || pos[1] < 0) return false;
	if (pos[0] > process.stdout.columns || pos[1] > process.stdout.rows) return false;
	return true;
}

const amINotOverlapping = () => {
	if (trail.some((step, i) => i !== score && step.join(',') === pos.join(','))) return false;
	return true;
}

process.stdin.setEncoding('utf-8');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", data => {
	if (data === 'q') quit();
const key = data[data.toString().length - 1];
	switch (key) {
		case 'A':
			dir = 90;
			break;
		case 'B':
			dir = 270;
			break;
		case 'C':
			dir = 0;
			break;
		case 'D':
			dir = 180;
			break;
		default:
	}
});

const move = () => {
	switch (dir) {
		case 0:
			pos[0]++;
			break;
		case 90:
			pos[1]--;
			break;
		case 180:
			pos[0]--;
			break;
		case 270:
			pos[1]++;
			break;
		default:
	}
}

const writeTo = (loc=pos, txt=' ') => {
	placeCursor(loc);
	_(txt);
	placeCursor();
}

const makeFood = () => {
	let newX, newY;
	while (!newX || trail.some(([x]) => newX-1 === x || newX+1 === x)) newX = Math.floor(Math.random() * (process.stdout.columns - 2));
	while (!newY || trail.some(([,y]) => newY-1 === y || newY+1 === y)) newY = Math.floor(Math.random() * (process.stdout.rows - 2));
	(new Array(3).fill(null)).forEach((_, i) => writeTo([food[0]+i, food[1]]));
	writeTo(pos, 'O');
	food[0] = newX; food[1] = newY;
	writeTo(food, 'yum');
}

const wait = async (time=150) => new Promise((res) => setTimeout(res, time));

const quit = () => {
showCursor();
clear();
pos[0] = pos[1] = 0;
placeCursor();
console.log(`GAME OVER (Ate ${score} yums)`);
process.exit(0);
}
makeFood();
let clock = 0;
(async () => {
while (amIInBounds() && amINotOverlapping()) {
	clock++;
	placeCursor();
	_('O');
	for (let step of trail) writeTo(step, 'o');
	trail.push([...pos]);
	if (trail.length > score + 3) {
		writeTo(trail[0]);
		trail.shift();
	}
	if ((new Array(3).fill(null)).some((_, i) => ((food[0]+i)+','+food[1]) === pos.join(','))) {
		score++;
		makeFood();
	}

	await wait(100 - Math.min(92, (score * 8)));
	move();
}
quit();
})();

