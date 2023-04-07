import { Utility } from "./Utility.js"
export const ShotPatterns =[
    function(enemy,player){
        let rnd = random(1,1000)
        if(rnd <= 5){
            let pos ={x:enemy.pos.x,y:enemy.pos.y}
            let color = "#990000"
            let size = 10
            let lifeTime = -1
            let v = Utility.sbulletCalc(player.pos,enemy.pos)
            let speed={x:v.x*10,y:v.y*10}
            enemy.newEnemyBullet(pos,color,size,lifeTime,speed)
        }
    },
    function(enemy,player){
        if(!enemy.shotDelay){
            enemy.shotDelay = 0
        }
        if(enemy.shotDelay < 0){
            enemy.shotDelay = 6
            let ppos = Object.assign({},player.pos);
            let rnd = random(-100,100)
            ppos.x += rnd
            rnd = random(-100,100)
            ppos.y += rnd
            let pos ={x:enemy.pos.x,y:enemy.pos.y}
            let color = "#990000"
            let size = 15
            let lifeTime = -1
            let v = Utility.sbulletCalc(ppos,enemy.pos)
            let speed={x:v.x*3,y:v.y*3}
            enemy.newEnemyBullet(pos,color,size,lifeTime,speed)
        }
        enemy.shotDelay--
    }
]