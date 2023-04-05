var context

let MotherShip = {
	maxhp:10,
	credit:0
}

let base = {
	credit:0
}

let options = {
	enemy_max_amprate:600,
	enemy_max_start:10,
	enemy_speed_amprate:1800,
	enemy_speed_start:1,
	spawn_rate_amprate:3000,
	spawn_rate_start:5,
	autoshot:false
}

function controllerChange(event){
	switch(event.id){
		case "autoshot":
			options.autoshot = event.checked
	}

}

let canvas = {x:500,y:500}
let gameStatus = {
	mode:"title",
	score:0
}

class enemy{
	constructor(pos,hp,size,color,score,speed={x:0,y:0}){
		this.pos = {x:pos.x,y:pos.y}
		this.size = size
		this.hp = hp
		this.color = color
		this.score = score
		this.speed = {x:speed.x,y:speed.y}
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
	progress:0,
	enemy_max:0,
	enemy_speed:0,
	spawn_rate:0
}

// 敵の種類
let enemytypes = {
	normal:{
		rate:10,
		hp:3,
		size:25,
		color:"#FF0000",
		speed:{x:0,y:1},
		score:1
	},
	middle:{
		rate:5,
		hp:5,
		size:50,
		color:"#FF0000",
		speed:{x:0,y:2},
		score:2
	}
}

// 敵の追加の種類
let advanceEnemyTypes = {
	deka:{
		rate:1,
		hp:20,
		size:250,
		color:"#FF0000",
		speed:{x:0,y:2},
		score:10
	}
}

// 初期設定保存用
const defaultEnemyTypesSet = enemytypes

let player = {
	pos:{x:250,y:400},
	speed:5,
	shotPos:[]
}

let enemys = []

let bgms = {
	bgm:null,
	bgm2:null,
	game_over:null
}

let sounds = {
	shot:null,
	damage:null,
	destroy:null,
	pdestroy:null,
	game_start:null
}

// 準備処理
function preload(){
	context = new AudioContext()
	sounds.shot = loadSound("./sounds/shot.mp3")
	sounds.damage = loadSound("./sounds/damage.mp3")
	sounds.destroy = loadSound("./sounds/destroy.mp3")
	sounds.pdestroy = loadSound("./sounds/pdestroy.mp3")
	sounds.game_start = loadSound("./sounds/game_start.mp3")
	bgms.bgm = loadSound("./sounds/bgm.mp3")
	bgms.bgm.setVolume(0.5)
	bgms.bgm2 = loadSound("./sounds/bgm_title.mp3")
	bgms.bgm2.setVolume(0.5)
	bgms.game_over = loadSound("./sounds/bgm_game_over.mp3")
	bgms.game_over.setVolume(0.5)
}

function setup(){
	let canvasElement = createCanvas(canvas.x, canvas.y)
	let canvasParentElement = document.getElementById('GameCanvas');
	canvasElement.parent(canvasParentElement);
	background('#ffffff')
	frameRate(60)
	scoreElement = document.getElementById("score")
}

// p5.jsのメインループ
function draw(){
	switch (gameStatus.mode) {
		case "title":
			menueloop()
			break
		case "play":
			mainloop()
			break
		case "game_over":
			break
	}	
}

// ゲームのメインループ
function mainloop(){
	control()
	// 画面フラッシュ処理
	background('#FFFFFF')
	
	// ステージ進行
	stageStatus.progress++

	// グリッド表示
	drawGrid("#000000")


	// 難易度調整
	stageStatus.enemy_max = stageStatus.progress / options.enemy_max_amprate + options.enemy_max_start
	stageStatus.enemy_speed = stageStatus.progress / options.enemy_speed_amprate + options.enemy_speed_start
	stageStatus.spawn_rate = stageStatus.progress / options.spawn_rate_amprate + options.spawn_rate_start
	
	// 自機処理
  	fill('#0000FF')
	triangle(-25+player.pos.x, 25+player.pos.y, 0+player.pos.x, -25+player.pos.y, 25+player.pos.x,25+player.pos.y)
	fill('#00FFFF')
	circle(player.pos.x,player.pos.y,10)

	// 敵出現処理spawn_rate
	if(enemys.length < stageStatus.enemy_max){
		if(random(1,100) < stageStatus.spawn_rate){
			let ratesum = 0
			Object.keys(enemytypes).forEach(key => {
				ratesum += enemytypes[key].rate
			})

			let enemytypernd = random(0,ratesum)
			
			ratesum = 0
			Object.keys(enemytypes).forEach(key => {
				enemytypernd -= enemytypes[key].rate
				if(enemytypernd < 0 && enemytypernd + enemytypes[key].rate >= 0){ 
					let px = random(10, canvas.x - 10)
					let py = random(-100, 0)
					enemys.push(new enemy({x:px,y:py},enemytypes[key].hp,enemytypes[key].size,enemytypes[key].color,enemytypes[key].score,{x:enemytypes[key].speed.x*stageStatus.enemy_speed,y:enemytypes[key].speed.y*stageStatus.enemy_speed}))
				}
			})
		}
	}
	
	// 敵処理
	for(i=0;i<enemys.length;i++){
		fill(enemys[i].color)
		enemys[i].pos.x += enemys[i].speed.x
		enemys[i].pos.y += enemys[i].speed.y
		// 敵の生存エリア
		if(enemys[i].pos.x > -100 && enemys[i].pos.x < canvas.x + 100 && enemys[i].pos.y > 0 - 100 && enemys[i].pos.y < canvas.y + 100){
			// 敵描画(HitCircle)
			circle(enemys[i].pos.x,enemys[i].pos.y,enemys[i].size)
			if(0 > dist(enemys[i].pos.x,enemys[i].pos.y,player.pos.x,player.pos.y) - (enemys[i].size/2)){
				sounds.pdestroy.play()
				bgms.bgm.stop()
				bgms.game_over.loop()
				// ゲームオーバー処理
				alert(`GAME OVER
${gameStatus.score}点でした。`)
				gameStatus.mode = "game_over"
			}
		}else{
			enemys.splice(i,1)
		}
	}

	// 自機弾処理
	for(i=0;i<player["shotPos"].length;i++){
		player.shotPos[i].y -= player.shotPos[i].vy
		player.shotPos[i].x -= player.shotPos[i].vx
		if(player.shotPos[i].x > 0 - player.shotPos[i].size/2 && player.shotPos[i].x < canvas.x + player.shotPos[i].size/2&& player.shotPos[i].y > 0 - player.shotPos[i].size/2 && player.shotPos[i].y < canvas.y + player.shotPos[i].size/2){
			// 描画判定
			fill(player.shotPos[i].color)
			circle(player.shotPos[i].x,player.shotPos[i].y, player.shotPos[i].size)
			
			// 敵当たり判定
			for(let l = 0;l < enemys.length;l++){
				if(0 > dist(enemys[l].pos.x,enemys[l].pos.y,player.shotPos[i].x,player.shotPos[i].y) - (enemys[l].size/2) - (player.shotPos[i].size)/2){
					// HIT時
					if(enemys[l].damage()){
						sounds.destroy.play()
						addscore(enemys[l].score)
						enemys.splice(l,1)
					}else{
						sounds.damage.play()
					}
					player.shotPos.splice(i,1)
					break
				}
			}

		}else{
			// 画面外の弾の削除
			player.shotPos.splice(i,1)
		}
	}
	
}

// ゲーム中の入力処理
function control(){
	if (keyIsPressed) {
		if ((bit&(1<<KEY_CODES.w))>0 || (bit&(1<<KEY_CODES.up))>0){
			if(player.pos.y > 0 ){
				player.pos.y -= player.speed
			}
		}
		if ((bit&(1<<KEY_CODES.s))>0 || (bit&(1<<KEY_CODES.down))>0){
			if(player.pos.y < canvas.y){
				player.pos.y += player.speed
			}
		}
		if ((bit&(1<<KEY_CODES.a))>0 || (bit&(1<<KEY_CODES.left))>0){
			if(player.pos.x > 0){
				player.pos.x -= player.speed
			}
		}
		if ((bit&(1<<KEY_CODES.d))>0 || (bit&(1<<KEY_CODES.right))>0){
			if(player.pos.x < canvas.x){
				player.pos.x += player.speed
			}
		}
		if ((bit&(1<<KEY_CODES.SPACE))>0){
			if(pastShot <= 0 && !options.autoshot){
				shot()
			}
		}
	}
	if(options.autoshot && !((bit&(1<<KEY_CODES.SPACE))>0)){
		if(pastShot <= 0){
			shot()
		}
	}
	pastShot--
}

// メニューやタイトル画面等の処理
let menuCount = 0
let gameStartFlag = false
let gameStartFlagTime = 0
function menueloop(){
	menueControl()
	// 画面フラッシュ処理
	background('#EEEEEE')
	if(Math.floor(menuCount/30) % 2 || gameStartFlag){
		fill("#000000")
		textSize(41)
		text("Space to Start...",20,canvas.y/2)
		fill("#333333")
		text("Space to Start...",20+2,canvas.y/2+2)
	}

	if(gameStartFlag){
		if(menuCount - gameStartFlagTime > 180){
			gameStartFlag = false
			menuCount = 0;
			gameStatus.mode = "play"
			bgms.bgm.loop()
		}
	}
	menuCount++
}

function menueControl(){
	if (keyIsPressed) {
		// if ((bit&(1<<KEY_CODES.w))>0 || (bit&(1<<KEY_CODES.up))>0){
		// }
		// if ((bit&(1<<KEY_CODES.s))>0 || (bit&(1<<KEY_CODES.down))>0){
		// }
		// if ((bit&(1<<KEY_CODES.a))>0 || (bit&(1<<KEY_CODES.left))>0){
		// }
		// if ((bit&(1<<KEY_CODES.d))>0 || (bit&(1<<KEY_CODES.right))>0){
		// }
		if ((bit&(1<<KEY_CODES.SPACE))>0){
			if(!gameStartFlag){
				gameStartFlag = true
				gameStartFlagTime = menuCount
				sounds.game_start.play()
			}
		}
	}
}

let pastShot = 0
function shot(){
	sounds.shot.play()
	pastShot = 10
	player.shotPos.push({x:player.pos.x,y:player.pos.y,vx:0,vy:10,size:10,color:"#FF0000"})
}


let bit
let KEY_CODES = {
	w:87,up:38,
	a:65,left:37,
	s:83,down:40,
	d:68,right:39,
	SPACE:32
}
function keyPressed() {
	bit |= (1<<keyCode)
	//print("KeyCode:"+ keyCode + "BIT:" + bit)
}

function keyReleased() {
	bit &= ~(1<<keyCode)
}

function drawGrid(color="#000000",mode="stage") {
	switch (mode) {
		case "stage":
			fill(color)
			textSize(10)
			for(var i = 0; i < 10; i++) {
				for(var j = 0; j < 10; j++) {
					stroke(color)
					line(i * 50, 0, i * 50, 500)
					noStroke()
					text(i * 50, (i * 50) + 2, 10)
					stroke(color)
					line(0, j * 50 + stageStatus.progress % 50, 600, j * 50 + stageStatus.progress % 50)
					noStroke()
					text( Math.floor((stageStatus.progress)/50)*50+(500-j*50), 2, (j * 50) + 10 + stageStatus.progress % 50 )
					stroke(0)
				}
			}
			break
		case "dispGrid":
			fill(color)
			textSize(10)
			for(var i = 0; i < 10; i++) {
				for(var j = 0; j < 10; j++) {
					stroke(color)
					line(i * 50, 0, i * 50, 500)
					noStroke()
					text(i * 50, (i * 50) + 2, 10)
					stroke(color)
					line(0, j * 50, 600, j * 50)
					noStroke()
					text(j * 50, 2, (j * 50) + 10)
					stroke(0)
				}
			}
			break
		default:
			break
	}

}

// スコア更新処理
let scoreElement
function addscore(point){
	gameStatus.score += point
	scoreElement.value = gameStatus.score
}