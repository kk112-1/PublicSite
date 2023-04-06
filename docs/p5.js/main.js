import { MovePatterns } from "./MovePatterns.js"
var context
class GameMainClass{
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
		this.canvas = {x:500,y:500}
		this.gameStatus = {
			mode:"play",
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
			normal:{
				rate:10,
				hp:3,
				size:25,
				color:"#FF0000",
				speed:{x:0,y:1},
				score:1
			},
			middle:{
				rate:0,
				hp:5,
				size:50,
				color:"#FF0000",
				speed:{x:0,y:2},
				score:2
			},
			wave:{
				rate:10,
				hp:2,
				size:15,
				color:"#FF0000",
				speed:{x:0,y:1},
				score:1,
				movePattern:MovePatterns[0],
			},
			wave2:{
				rate:10,
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
		// メニューやタイトル画面等の処理
		this.menuCount = 0
		this.gameStartFlag = false
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
		Utility.drawGrid("#000000")


		// 難易度調整
		this.stageStatus.enemy_max = this.stageStatus.progress / this.options.enemy_max_amprate + this.options.enemy_max_start
		this.stageStatus.enemy_speed = this.stageStatus.progress / this.options.enemy_speed_amprate + this.options.enemy_speed_start
		this.stageStatus.spawn_rate = this.stageStatus.progress / this.options.spawn_rate_amprate + this.options.spawn_rate_start
		
		// 自機処理
		fill('#0000FF')
		triangle(-25+this.player.pos.x, 25+this.player.pos.y, 0+this.player.pos.x, -25+this.player.pos.y, 25+this.player.pos.x,25+this.player.pos.y)
		fill('#00FFFF')
		circle(this.player.pos.x,this.player.pos.y,10)

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
						let px = random(10, this.canvas.x - 10)
						let py = random(-100, 0)
						this.enemys.push(new Enemy({x:px,y:py},this.enemytypes[key].hp,this.enemytypes[key].size,this.enemytypes[key].color,this.enemytypes[key].score,{x:this.enemytypes[key].speed.x*this.stageStatus.enemy_speed,y:this.enemytypes[key].speed.y*this.stageStatus.enemy_speed},this.enemytypes[key].movePattern))
					}
				})
			}
		}
		
		// 敵処理
		for(let i=0;i<this.enemys.length;i++){
			fill(this.enemys[i].color)
			this.enemys[i].pos.x += this.enemys[i].speed.x
			this.enemys[i].pos.y += this.enemys[i].speed.y
			if(this.enemys[i].movePattern){
				if(!this.enemys[i].moveCount || this.enemys[i].moveCount>=this.enemys[i].movePattern.length){
					this.enemys[i].moveCount = 0;
				}
				this.enemys[i].pos.x += this.enemys[i].movePattern[this.enemys[i].moveCount].x
				this.enemys[i].pos.y += this.enemys[i].movePattern[this.enemys[i].moveCount].y

				this.enemys[i].moveCount++
			}
			// 敵の生存エリア
			if(this.enemys[i].pos.x > -100 && this.enemys[i].pos.x < this.canvas.x + 100 && this.enemys[i].pos.y > 0 - 100 && this.enemys[i].pos.y < this.canvas.y + 100){
				// 敵描画(HitCircle)
				circle(this.enemys[i].pos.x,this.enemys[i].pos.y,this.enemys[i].size)
				if(0 > dist(this.enemys[i].pos.x,this.enemys[i].pos.y,this.player.pos.x,this.player.pos.y) - (this.enemys[i].size/2)){
					this.sounds.pdestroy.play()
					this.bgms.bgm.stop()
					this.bgms.game_over.loop()
					// ゲームオーバー処理
					alert(`GAME OVER
${this.gameStatus.score}点でした。`)
					this.gameStatus.mode = "game_over"
				}
			}else{
				this.enemys.splice(i,1)
			}
		}

		// 自機弾処理
		for(let i=0;i<this.player["shotPos"].length;i++){
			this.player.shotPos[i].y -= this.player.shotPos[i].vy
			this.player.shotPos[i].x -= this.player.shotPos[i].vx
			if(this.player.shotPos[i].x > 0 - this.player.shotPos[i].size/2 && this.player.shotPos[i].x < this.canvas.x + this.player.shotPos[i].size/2&& this.player.shotPos[i].y > 0 - this.player.shotPos[i].size/2 && this.player.shotPos[i].y < this.canvas.y + this.player.shotPos[i].size/2){
				// 描画判定
				fill(this.player.shotPos[i].color)
				circle(this.player.shotPos[i].x,this.player.shotPos[i].y, this.player.shotPos[i].size)
				
				// 敵当たり判定
				for(let l = 0;l < this.enemys.length;l++){
					if(0 > dist(this.enemys[l].pos.x,this.enemys[l].pos.y,this.player.shotPos[i].x,this.player.shotPos[i].y) - (this.enemys[l].size/2) - (this.player.shotPos[i].size)/2){
						// HIT時
						if(this.enemys[l].damage()){
							this.sounds.destroy.play()
							HtmlController.addscore(this.enemys[l].score)
							this.enemys.splice(l,1)
						}else{
							this.sounds.damage.play()
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
		
	}

	// ゲーム中の入力処理
	control(){
		if (keyIsPressed) {
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.w))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.up))>0){
				if(this.player.pos.y > 0 ){
					this.player.pos.y -= this.player.speed
				}
			}
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.s))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.down))>0){
				if(this.player.pos.y < this.canvas.y){
					this.player.pos.y += this.player.speed
				}
			}
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.a))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.left))>0){
				if(this.player.pos.x > 0){
					this.player.pos.x -= this.player.speed
				}
			}
			if ((KeySystem.bit&(1<<KeySystem.KEY_CODES.d))>0 || (KeySystem.bit&(1<<KeySystem.KEY_CODES.right))>0){
				if(this.player.pos.x < this.canvas.x){
					this.player.pos.x += this.player.speed
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
		this.sounds.shot.play()
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
			text("Space to Start...",20,this.canvas.y/2)
			fill("#333333")
			text("Space to Start...",20+2,this.canvas.y/2+2)
		}

		if(this.gameStartFlag){
			if(this.menuCount - this.gameStartFlagTime > 180){
				this.gameStartFlag = false
				this.menuCount = 0;
				this.gameStatus.mode = "play"
				this.bgms.bgm.loop()
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
					this.gameStartFlag = true
					this.gameStartFlagTime = this.menuCount
					this.sounds.game_start.play()
				}
			}
		}
	}
}
let gmc = new GameMainClass()

class Enemy{
	constructor(pos,hp,size,color,score,speed={x:0,y:0},movePattern=null){
		this.pos = {x:pos.x,y:pos.y}
		this.size = size
		this.hp = hp
		this.color = color
		this.score = score
		this.speed = {x:speed.x,y:speed.y}
		this.movePattern = movePattern
	}

	damage(damage = 1){
		this.hp -= damage
		if(this.hp <= 0){
			return true
		}
		return false
	}
}

// // p5.jsの準備処理
window.preload = () => {
	context = new AudioContext()
	gmc.sounds.shot = loadSound("./sounds/shot.mp3")
	gmc.sounds.damage = loadSound("./sounds/damage.mp3")
	gmc.sounds.destroy = loadSound("./sounds/destroy.mp3")
	gmc.sounds.pdestroy = loadSound("./sounds/pdestroy.mp3")
	gmc.sounds.game_start = loadSound("./sounds/game_start.mp3")
	gmc.bgms.bgm = loadSound("./sounds/bgm.mp3")
	gmc.bgms.bgm.setVolume(0.5)
	gmc.bgms.bgm2 = loadSound("./sounds/bgm_title.mp3")
	gmc.bgms.bgm2.setVolume(0.5)
	gmc.bgms.game_over = loadSound("./sounds/bgm_game_over.mp3")
	gmc.bgms.game_over.setVolume(0.5)
}

// p5.jsのセットアップ
window.setup = () => {
	let canvasElement = createCanvas(gmc.canvas.x, gmc.canvas.y)
	let canvasParentElement = document.getElementById('GameCanvas');
	canvasElement.parent(canvasParentElement);
	background('#ffffff')
	frameRate(60)
	HtmlController.scoreElement = document.getElementById("score")
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

class Utility{
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
		switch(event.id){
			case "autoshot":
				gmc.options.autoshot = event.checked
		}

	}

	// スコア更新処理
	static scoreElement
	static addscore(point){
		gmc.gameStatus.score += point
		this.scoreElement.value = gmc.gameStatus.score
	}
}
