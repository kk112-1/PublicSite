let canvas = {"x":500,"y":500}
let gameStatus = {
	"mode":"play",
	"score":0
}

class enemy{
	constructor(pos,hp,size,color,speed={"x":0,"y":0}){
		this.pos = {"x":pos["x"],"y":pos["y"]}
		this.size = size
		this.hp = hp
		this.color = color
		this.speed = {"x":speed["x"],"y":speed["y"]}
	}

	damage(damage = 1){
		this.hp -= damage
		if(this.hp <= 0){
			return true
		}
		return false
	}
}


let stageStatus = {
	"progress":0,
	"enemy_max":0,
	"enemy_speed":0,
	"spawn_rate":0
}

let player = {
	"pos":{"x":250,"y":400},
	"speed":5,
	"shotPos":[]
}

let enemys = []
let bgms = {
	"bgm":null,
	"game_over":null
}
let sounds = {
	"shot":null,
	"damage":null,
	"destroy":null,
	"pdestroy":null
}

function preload(){
	sounds["shot"] = loadSound("./sounds/shot.mp3")
	sounds["damage"] = loadSound("./sounds/damage.mp3")
	sounds["destroy"] = loadSound("./sounds/destroy.mp3")
	sounds["pdestroy"] = loadSound("./sounds/pdestroy.mp3")
	bgms["bgm"] = loadSound("./sounds/bgm.mp3")
	bgms["game_over"] = loadSound("./sounds/game_over.mp3")
}

function setup(){
	createCanvas(canvas["x"], canvas["y"]);
	background('#ffffff');
	frameRate(60);
	bgms["bgm"].loop()
}

function draw(){
	switch (gameStatus["mode"]) {
		case "play":
			mainloop()
			control()
			break;
		case "game_over":
			break;
	}	
}

function mainloop(){
	// 画面フラッシュ処理
	background('#FFFFFF');
	
	// ステージ進行
	stageStatus["progress"]++

	// グリッド表示
	drawGrid("#000000")

	// 難易度調整
	stageStatus["enemy_max"] = stageStatus["progress"] / 600 + 10
	stageStatus["enemy_speed"] = stageStatus["progress"] / 1800 + 1
	stageStatus["spawn_rate"] = stageStatus["progress"] / 3000 + 5
	// 自機処理
  	fill('#0000FF')
	triangle(-25+player["pos"]["x"], 25+player["pos"]["y"], 0+player["pos"]["x"], -25+player["pos"]["y"], 25+player["pos"]["x"],25+player["pos"]["y"])
	fill('#00FFFF')
	circle(player["pos"]["x"],player["pos"]["y"],10)

	// 敵出現処理spawn_rate
	if(enemys.length < stageStatus["enemy_max"]){
		if(random(1,100) < stageStatus["spawn_rate"]){
			let px = random(10, canvas["x"] - 10)
			let py = random(-100, 0)
			enemys.push(new enemy({"x":px,"y":py},3,25,"#FF0000",{"x":0,"y":stageStatus["enemy_speed"]}))
		}
	}
	
	// 敵処理
	for(i=0;i<enemys.length;i++){
		fill(enemys[i].color)
		enemys[i].pos["x"] += enemys[i].speed["x"]
		enemys[i].pos["y"] += enemys[i].speed["y"]
		if(enemys[i].pos["x"] > 0 && enemys[i].pos["x"] < canvas["x"] && enemys[i].pos["y"] > 0 - 100 && enemys[i].pos["y"] < canvas["y"]){
			circle(enemys[i].pos["x"],enemys[i].pos["y"],enemys[i].size)
			if(0 > dist(enemys[i].pos["x"],enemys[i].pos["y"],player["pos"]["x"],player["pos"]["y"]) - (enemys[i].size/2)){
				sounds["pdestroy"].play()
				bgms["bgm"].stop()
				bgms["game_over"].loop()
				alert(`GAME OVER
${gameStatus["score"]}点でした。`)
				gameStatus["mode"] = "game_over"
			}
		}else{
			enemys.splice(i,1)
		}
	}

	// 自機弾処理
	for(i=0;i<player["shotPos"].length;i++){
		player["shotPos"][i]["y"] -= player["shotPos"][i]["vy"]
		player["shotPos"][i]["x"] -= player["shotPos"][i]["vx"]
		if(player["shotPos"][i]["x"] > 0 - player["shotPos"][i]["size"]/2 && player["shotPos"][i]["x"] < canvas["x"] + player["shotPos"][i]["size"]/2&& player["shotPos"][i]["y"] > 0 - player["shotPos"][i]["size"]/2 && player["shotPos"][i]["y"] < canvas["y"] + player["shotPos"][i]["size"]/2){
			// 描画判定
			fill(player["shotPos"][i]["color"])
			circle(player["shotPos"][i]["x"],player["shotPos"][i]["y"], player["shotPos"][i]["size"]);
			
			// 敵当たり判定
			for(let l = 0;l < enemys.length;l++){
				if(0 > dist(enemys[l].pos["x"],enemys[l].pos["y"],player["shotPos"][i]["x"],player["shotPos"][i]["y"]) - (enemys[l].size/2) - (player["shotPos"][i]["size"])/2){
					// HIT時
					if(enemys[l].damage()){
						sounds["destroy"].play()
						enemys.splice(l,1)
						gameStatus["score"]++
					}else{
						sounds["damage"].play()
					}
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
			if(player["pos"]["y"] > 0 ){
				player["pos"]["y"] -= player.speed
			}
		}
		if ((bit&(1<<KEY_CODES["s"]))>0){
			if(player["pos"]["y"] < canvas["y"]){
				player["pos"]["y"] += player.speed
			}
		}
		if ((bit&(1<<KEY_CODES["a"]))>0){
			if(player["pos"]["x"] > 0){
				player["pos"]["x"] -= player.speed
			}
		}
		if ((bit&(1<<KEY_CODES["d"]))>0){
			if(player["pos"]["x"] < canvas["x"]){
				player["pos"]["x"] += player.speed
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
	sounds["shot"].play()
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

function drawGrid(color="#000000",mode="stage") {
	switch (mode) {
		case "stage":
			fill(color)
			textSize(10);
			for(var i = 0; i < 10; i++) {
				for(var j = 0; j < 10; j++) {
					stroke(color);
					line(i * 50, 0, i * 50, 500);
					noStroke();
					text(i * 50, (i * 50) + 2, 10);
					stroke(color);
					line(0, j * 50 + stageStatus["progress"] % 50, 600, j * 50 + stageStatus["progress"] % 50);
					noStroke()
					text( Math.floor((stageStatus["progress"])/50)*50+(500-j*50), 2, (j * 50) + 10 + stageStatus["progress"] % 50 );
					stroke(0);
				}
			}
			break;
		case "dispGrid":
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
			break;
		default:
			break;
	}

}

