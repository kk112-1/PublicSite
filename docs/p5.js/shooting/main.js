import { MovePatterns } from "./MovePatterns.js"
import { ShotPatterns } from "./ShotPatterns.js"
import { Utility } from "./Utility.js"
var context
class Asset{
	constructor(){
		this.bgms = {
			bgm:null,
			bgm2:null,
			game_over:null
		}
		this.sounds = {
			shot:null,
			damage:null,
			destroy:null,
			pdestroy:null,
			game_start:null
		}
	}
}
let asset = new Asset()

class GameMainClass{
	static canvas = {x:500,y:500}
	constructor(){
		this.options = {
			enemy_max_amprate:600,
			enemy_max_start:10,
			enemy_speed_amprate:1800,
			enemy_speed_start:1,
			spawn_rate_amprate:3000,
			spawn_rate_start:5,
			autoshot:false
		}
		this.gameStatus = {
			mode:"title",
			// mode:"play",
			score:0
		}
		this.stageStatus = {
			progress:0,
			enemy_max:0,
			enemy_speed:0,
			spawn_rate:0
		}
		// 敵の種類
		this.enemytypes = {
			fighter:{
				rate:5,
				hp:3,
				size:25,
				color:"#FF0000",
				speed:{x:0,y:3},
				score:3,
				shotPattern:[ShotPatterns[0]],
			},
			middle:{
				rate:1,
				hp:5,
				size:50,
				color:"#FF0000",
				speed:{x:0,y:1},
				score:3,
				shotPattern:[ShotPatterns[1]],
			},
			wave:{
				rate:5,
				hp:2,
				size:15,
				color:"#FF0000",
				speed:{x:0,y:1},
				score:1,
				movePattern:MovePatterns[0],
			},
			wave2:{
				rate:5,
				hp:2,
				size:15,
				color:"#FF0000",
				speed:{x:0,y:1},
				score:1,
				movePattern:MovePatterns[1],
			}
		}
		// 敵の追加の種類
		this.advanceEnemyTypes = {
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
		this.defaultEnemyTypesSet = this.enemytypes
		this.player = {
			pos:{x:250,y:400},
			speed:5,
			shotPos:[]
		}
		
		this.enemys = []
		this.enemy_bullets = []

		// メニューやタイトル画面等の処理
		this.menuCount = 0
		this.gameStartFlag = 0
		this.gameStartFlagTime = 0
		// ショットの間隔
		this.pastShot = 0
	}
	
	// ゲームのメインループ
	mainloop(){
		this.control()
		// 画面フラッシュ処理
		background('#FFFFFF')
		
		// ステージ進行
		this.stageStatus.progress++

		// グリッド表示
		SUtility.drawGrid("#000000")


		// 難易度調整
		this.stageStatus.enemy_max = this.stageStatus.progress / this.options.enemy_max_amprate + this.options.enemy_max_start
		this.stageStatus.enemy_speed = 1// this.stageStatus.progress / this.options.enemy_speed_amprate + this.options.enemy_speed_start
		this.stageStatus.spawn_rate = this.stageStatus.progress / this.options.spawn_rate_amprate + this.options.spawn_rate_start
		
		// 自機処理
		fill('#0000FF')
		triangle(-25+this.player.pos.x, 25+this.player.pos.y, 0+this.player.pos.x, -25+this.player.pos.y, 25+this.player.pos.x,25+this.player.pos.y)
		fill('#00FFFF')
		circle(this.player.pos.x,this.player.pos.y,10)
		print(this.player.pos.x,this.player.pos.y)
		// 敵出現処理spawn_rate
		if(this.enemys.length < this.stageStatus.enemy_max){
			if(random(1,100) < this.stageStatus.spawn_rate){
				let ratesum = 0
				Object.keys(this.enemytypes).forEach(key => {
					ratesum += this.enemytypes[key].rate
				})

				let enemytypernd = random(0,ratesum)
				
				ratesum = 0
				Object.keys(this.enemytypes).forEach(key => {
					enemytypernd -= this.enemytypes[key].rate
					if(enemytypernd < 0 && enemytypernd + this.enemytypes[key].rate >= 0){ 
						let px = random(10, GameMainClass.canvas.x - 10)
						let py = random(-100, 0)
						this.enemys.push(new Enemy({x:px,y:py},this.enemytypes[key].hp,this.enemytypes[key].size,this.enemytypes[key].color,this.enemytypes[key].score,{x:this.enemytypes[key].speed.x*this.stageStatus.enemy_speed,y:this.enemytypes[key].speed.y*this.stageStatus.enemy_speed},this.enemytypes[key].movePattern,this.enemytypes[key].shotPattern))
					}
				})
			}
		}
		
		// 敵処理
		for(let i=0;i<this.enemys.length;i++){
			if(!this.enemys[i].move()){
				this.enemys.splice(i,1)
				i--;
			}else{
				this.enemys[i].shots()
			}
		}

		// 自機弾処理
		for(let i=0;i<this.player["shotPos"].length;i++){
			this.player.shotPos[i].y -= this.player.shotPos[i].vy
			this.player.shotPos[i].x -= this.player.shotPos[i].vx
			if(this.player.shotPos[i].x > 0 - this.player.shotPos[i].size/2 && this.player.shotPos[i].x < GameMainClass.canvas.x + this.player.shotPos[i].size/2&& this.player.shotPos[i].y > 0 - this.player.shotPos[i].size/2 && this.player.shotPos[i].y < GameMainClass.canvas.y + this.player.shotPos[i].size/2){
				// 描画判定
				fill(this.player.shotPos[i].color)
				circle(this.player.shotPos[i].x,this.player.shotPos[i].y, this.player.shotPos[i].size)
				
				// 敵当たり判定
				for(let l = 0;l < this.enemys.length;l++){
					if(0 > dist(this.enemys[l].pos.x,this.enemys[l].pos.y,this.player.shotPos[i].x,this.player.shotPos[i].y) - (this.enemys[l].size/2) - (this.player.shotPos[i].size)/2){
						// HIT時
						if(this.enemys[l].damage()){
							asset.sounds.destroy.play()
							HtmlController.addscore(this.enemys[l].score)
							this.enemys.splice(l,1)
						}else{
							asset.sounds.damage.play()
						}
						this.player.shotPos.splice(i,1)
						break
					}
				}

			}else{
				// 画面外の弾の削除
				this.player.shotPos.splice(i,1)
			}
		}

		// 敵弾処理
		for(let i=0;i<this.enemy_bullets.length;i++){
			if(!this.enemy_bullets[i].move()){
				this.enemy_bullets.splice(i,1)
				i--;
			}
		}		
	}

	// ゲーム中の入力処理
	control(){
		if (keyIsPressed) {
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.w))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.up))>0){
				this.player.pos.y -= this.player.speed
				if(this.player.pos.y < 0 ){
					this.player.pos.y = 0
				}
			}
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.s))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.down))>0){
				this.player.pos.y += this.player.speed
				if(this.player.pos.y > GameMainClass.canvas.y){
					this.player.pos.y = GameMainClass.canvas.y
				}
			}
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.a))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.left))>0){
				this.player.pos.x -= this.player.speed
				if(this.player.pos.x < 0){
					this.player.pos.x = 0
				}
			}
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.d))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.right))>0){
				this.player.pos.x += this.player.speed
				if(this.player.pos.x > GameMainClass.canvas.x){
					this.player.pos.x = GameMainClass.canvas.x
				}
			}
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.SPACE))>0){
				if(this.pastShot <= 0 && !this.options.autoshot){
					this.shot()
				}
			}
		}
		if(this.options.autoshot && !((KeySystem.bit&(1<<KeySystem.KEY_CODES.SPACE))>0)){
			if(this.pastShot <= 0){
				this.shot()
			}
		}
		this.pastShot--
	}

	shot(){
		asset.sounds.shot.play()
		this.pastShot = 10
		this.player.shotPos.push({x:this.player.pos.x,y:this.player.pos.y,vx:0,vy:10,size:10,color:"#FF0000"})
	}

	menueloop(){
		this.menueControl()
		// 画面フラッシュ処理
		background('#EEEEEE')
		if(Math.floor(this.menuCount/30) % 2 || this.gameStartFlag){
			fill("#000000")
			textSize(41)
			text("Space to Start...",20,GameMainClass.canvas.y/2)
			fill("#333333")
			text("Space to Start...",20+2,GameMainClass.canvas.y/2+2)
		}
		if(this.gameStartFlag){
			//this.gameStartFlag = 3 はスキップ
			if(this.menuCount - this.gameStartFlagTime > 180 || this.gameStartFlag == 3){
				this.gameStartFlag = 0
				asset.sounds.game_start.stop()
				this.menuCount = 0;
				this.gameStatus.mode = "play"
				asset.bgms.bgm.loop()
				HtmlController.gameInitialize()
			}
		}
		this.menuCount++
	}

	menueControl(){
		if (keyIsPressed) {
			// if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.w))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.up))>0){
			// }
			// if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.s))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.down))>0){
			// }
			// if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.a))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.left))>0){
			// }
			// if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.d))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.right))>0){
			// }
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.SPACE))>0){
				if(!this.gameStartFlag){
					this.gameStartFlag = 1
					this.gameStartFlagTime = this.menuCount
					asset.sounds.game_start.play()
				}else{
					// タイトルスキップ
					if(this.gameStartFlag == 2 ){
						this.gameStartFlag = 3
					}
				}
			}
		}
		if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.SPACE))==0 && this.gameStartFlag == 1){
			this.gameStartFlag = 2
		}
	}

}
let gmc = new GameMainClass()

class Enemy{
	constructor(pos,hp,size,color,score,speed={x:0,y:0},movePattern=null,shotPatterns=null){
		this.pos = {x:pos.x,y:pos.y}
		this.size = size
		this.hp = hp
		this.color = color
		this.score = score
		this.speed = {x:speed.x,y:speed.y}
		this.movePattern = movePattern
		this.shotPatterns = shotPatterns
	}

	damage(damage = 1){
		this.hp -= damage
		if(this.hp <= 0){
			return true
		}
		return false
	}

	move(){
		fill(this.color)
		this.pos.x += this.speed.x
		this.pos.y += this.speed.y
		if(this.movePattern){
			if(!this.moveCount || this.moveCount>=this.movePattern.length){
				this.moveCount = 0;
			}
			this.pos.x += this.movePattern[this.moveCount].x
			this.pos.y += this.movePattern[this.moveCount].y

			this.moveCount++
		}
		// 敵の生存エリア
		if(this.pos.x > -100 && this.pos.x < GameMainClass.canvas.x + 100 && this.pos.y > 0 - 100 && this.pos.y < GameMainClass.canvas.y + 100){
			// 敵描画(HitCircle)
			circle(this.pos.x,this.pos.y,this.size)
			if(0 > dist(this.pos.x,this.pos.y,gmc.player.pos.x,gmc.player.pos.y) - (this.size/2)){
				gmc.gameStatus.mode = "game_over"
			}
		}else{
			return false
		}
		return true
	}

	shots(){
		if(this.shotPatterns)this.shotPatterns.forEach(shotPattern => shotPattern(this,gmc.player))
	}

	newEnemyBullet(pos,color,size,lifeTime,speed={x:0,y:0},movePattern=null){
		gmc.enemy_bullets.push(new EnemyBullet(pos,color,size,lifeTime,speed,movePattern))
	}
}
class EnemyBullet{
	constructor(pos,color,size,lifeTime,speed={x:0,y:0},movePattern=null){
		this.speed = speed
		this.pos = pos
		this.color = color
		this.size = size
		this.lifeTime = lifeTime
		this.movePattern = movePattern
	}

	move(){
		fill(this.color)
		this.pos.x += this.speed.x
		this.pos.y += this.speed.y
		if(this.movePattern){
			if(!this.moveCount || this.moveCount>=this.movePattern.length){
				this.moveCount = 0;
			}
			this.pos.x += this.movePattern[this.moveCount].x
			this.pos.y += this.movePattern[this.moveCount].y
			this.moveCount++
		}
		// 弾の生存エリア
		if(this.pos.x > -100 && this.pos.x < GameMainClass.canvas.x + 100 && this.pos.y > 0 - 100 && this.pos.y < GameMainClass.canvas.y + 100){
			// 弾描画(HitCircle)
			circle(this.pos.x,this.pos.y,this.size)
			if(0 > dist(this.pos.x,this.pos.y,gmc.player.pos.x,gmc.player.pos.y) - (this.size/2)){
				gmc.gameStatus.mode = "game_over"
			}
		}else{
			return false
		}
		return true
	}

}

// // p5.jsの準備処理
window.preload = () => {
	context = new AudioContext()
	asset.sounds.shot = loadSound("./sounds/shot.mp3")
	asset.sounds.damage = loadSound("./sounds/damage.mp3")
	asset.sounds.destroy = loadSound("./sounds/destroy.mp3")
	asset.sounds.pdestroy = loadSound("./sounds/pdestroy.mp3")
	asset.sounds.game_start = loadSound("./sounds/game_start.mp3")
	asset.bgms.bgm = loadSound("./sounds/bgm.mp3")
	asset.bgms.bgm.setVolume(0.5)
	asset.bgms.bgm2 = loadSound("./sounds/bgm_title.mp3")
	asset.bgms.bgm2.setVolume(0.5)
	asset.bgms.game_over = loadSound("./sounds/bgm_game_over.mp3")
	asset.bgms.game_over.setVolume(0.3)
}

// p5.jsのセットアップ
window.setup = () => {
	let canvasElement = createCanvas(GameMainClass.canvas.x, GameMainClass.canvas.y)
	let canvasParentElement = document.getElementById('GameCanvas');
	canvasElement.parent(canvasParentElement);
	background('#ffffff')
	frameRate(60)
	HtmlController.initialize()
}

// p5.jsのメインループ
window.draw = () => {
	switch (gmc.gameStatus.mode) {
		case "title":
			gmc.menueloop()
			break
		case "play":
			gmc.mainloop()
			break
		case "game_over":
			asset.sounds.pdestroy.play()
			asset.bgms.bgm.stop()
			asset.bgms.game_over.loop()
			// ゲームオーバー処理
			alert(`GAME OVER${gmc.gameStatus.score}点でした。`)
			asset.bgms.game_over.stop()
			KeySystem.bit = 0
			gmc = new GameMainClass()
			gmc.gameStatus.mode = "title"
			break
	}	
}

class KeySystem{
	static bit
	static KEY_CODES = {
		w:87,up:38,
		a:65,left:37,
		s:83,down:40,
		d:68,right:39,
		SPACE:32
	}
}

// p5.jsのキー押下
window.keyPressed = () =>  {
	KeySystem.bit |= (1<<keyCode)
	//print("KeyCode:"+ keyCode + "BIT:" + KeySystem.bit)
}

// p5.jsのキー開放
window.keyReleased = () => {
	KeySystem.bit &= ~(1<<keyCode)
}
class SUtility{
	static drawGrid(color="#000000",mode="stage") {
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
						line(0, j * 50 + gmc.stageStatus.progress % 50, 600, j * 50 + gmc.stageStatus.progress % 50)
						noStroke()
						text( Math.floor((gmc.stageStatus.progress)/50)*50+(500-j*50), 2, (j * 50) + 10 + gmc.stageStatus.progress % 50 )
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
}
class HtmlController{
	// htmlのコントローラーと連携用
	static controllerChange(event){
		switch(event.target.id){
			case "autoshot":
				if(event.target.dataset.checked=="false"){
					event.target.dataset.checked="true"
					gmc.options.autoshot = true
				}else{
					event.target.dataset.checked="false"
					gmc.options.autoshot = false
				}
				break
			case "speedChange":
				print(event.target.value)
				gmc.player.speed = parseInt(event.target.value)
				break
		}
	}

	// スコア更新処理
	static scoreElement
	static addscore(point){
		gmc.gameStatus.score += point
		this.scoreElement.value = gmc.gameStatus.score
	}

	static initialize(){
		this.scoreElement = document.getElementById("score")
	}
	
	static gameInitialize(){
		UIControlInterface.powerChange(2)
		if(document.getElementById("autoshot").dataset.checked=="true"){
			gmc.options.autoshot = true
		}else{
			gmc.options.autoshot = false
		}
		gmc.player.speed = document.getElementById("speedChange") ? parseInt(document.getElementById("speedChange").value) : 0
		this.scoreElement.value = 0
	}
}

window.HtmlController = HtmlController