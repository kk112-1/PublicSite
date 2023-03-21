let canvas = {"x":500,"y":500}

class enemy{
	constructor(pos,size){
		this.pos = {"x":pos["x"],"y":pos["y"]}
		this.size = size
	}
}

let enemys = [new enemy({"x":250,"y":100},25)]

function setup(){
	createCanvas(canvas["x"], canvas["y"]);
	background('#ffffff');
	frameRate(60);
}

let playerPos = {"x":250,"y":400}
let player = {
	"pos":playerPos,
	"speed":5,
	"shotPos":[]
}
function draw(){
	mainloop()
	control()
}

function mainloop(){
	// 画面フラッシュ処理
	background('#FFFFFF');

	// グリッド表示
	drawGrid("#000000")

	// 自機処理
  fill('#0000FF')
	triangle(-25+playerPos["x"], 25+playerPos["y"], 0+playerPos["x"], -25+playerPos["y"], 25+playerPos["x"],25+playerPos["y"])

	// 敵出現処理
	if(enemys.length < 10){
		let px = random(10, canvas["x"] - 10)
		let py = random(10, canvas["y"] - 200)
		enemys.push(new enemy({"x":px,"y":py},25))
	}
	
	// 敵処理
	for(i=0;i<enemys.length;i++){
		fill("#FF0000")
		circle(enemys[i].pos["x"],enemys[i].pos["y"],enemys[i].size)
	}

	// 弾処理
	for(i=0;i<player["shotPos"].length;i++){
		player["shotPos"][i]["y"] -= player["shotPos"][i]["vy"]
		player["shotPos"][i]["x"] -= player["shotPos"][i]["vx"]
		if(player["shotPos"][i]["x"] > 0 - player["shotPos"][i]["size"]/2 && player["shotPos"][i]["x"] < canvas["x"] + player["shotPos"][i]["size"]/2&& player["shotPos"][i]["y"] > 0 - player["shotPos"][i]["size"]/2 && player["shotPos"][i]["y"] < canvas["y"] + player["shotPos"][i]["size"]/2){
			// 描画判定
			fill(player["shotPos"][i]["color"])
			circle(player["shotPos"][i]["x"],player["shotPos"][i]["y"], player["shotPos"][i]["size"]);
			
			// 敵当たり判定
			for(let l = 0;l < enemys.length;l++){
				if(0 > dist(enemys[l].pos["x"],enemys[l].pos["y"],player["shotPos"][i]["x"],player["shotPos"][i]["y"]) - enemys[l].size - player["shotPos"][i]["size"]){
					// HIT時
					enemys.splice(l,1)
					player["shotPos"].splice(i,1)
					break;
				}
			}

		}else{
			// 画面外の弾の削除
			player["shotPos"].splice(i,1)
		}
	}
	
}

function control(){
	if (keyIsPressed) {
		if ((bit&(1<<KEY_CODES["w"]))>0){
			if(playerPos["y"] > 0 ){
				playerPos["y"] -= player.speed
			}
		}
		if ((bit&(1<<KEY_CODES["s"]))>0){
			if(playerPos["y"] < canvas["y"]){
				playerPos["y"] += player.speed
			}
		}
		if ((bit&(1<<KEY_CODES["a"]))>0){
			if(playerPos["x"] > 0){
				playerPos["x"] -= player.speed
			}
		}
		if ((bit&(1<<KEY_CODES["d"]))>0){
			if(playerPos["x"] < canvas["x"]){
				playerPos["x"] += player.speed
			}
		}
		if ((bit&(1<<KEY_CODES["SPACE"]))>0){
			if(pastShot <= 0){
				shot()
			}
		}
	}
	pastShot--
}

let pastShot = 0
function shot(){
	pastShot = 10
	player["shotPos"].push({"x":player["pos"]["x"],"y":player["pos"]["y"],"vx":0,"vy":10,"size":10,"color":"#FF0000"})
}


let bit;
let KEY_CODES = {
	'w':87,
	'a':65,
	's':83,
	'd':68,
	'SPACE':32
}
function keyPressed() {
	bit |= (1<<keyCode)
	print("KeyCode:"+ keyCode + "BIT:" + bit)
}

function keyReleased() {
	bit &= ~(1<<keyCode);
}

function drawGrid(color="#000000") {
	fill(color)
	textSize(10);
	for(var i = 0; i < 10; i++) {
		for(var j = 0; j < 10; j++) {
			stroke(color);
			line(i * 50, 0, i * 50, 500);
			noStroke();
			text(i * 50, (i * 50) + 2, 10);
			stroke(color);
			line(0, j * 50, 600, j * 50);
			noStroke();
			text(j * 50, 2, (j * 50) + 10);
			stroke(0);
		}
	}
}

