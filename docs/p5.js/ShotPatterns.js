import { Utility } from "./Utility.js"
export const ShotPatterns =[
    function(enemy,player){
        let rnd = random(1,100)
        if(rnd <= 2){
            let pos ={x:enemy.pos.x,y:enemy.pos.y}
            let color = "#990000"
            let size = 10
            let lifeTime = -1
            let v = Utility.sbulletCalc(player.pos,enemy.pos)
            let speed={x:v.x*5,y:v.y*5}
            console.log(speed);
            enemy.newEnemyBullet(pos,color,size,lifeTime,speed)
        }
    },
    function(enemy,player){
        if(!enemy.shotDelay){
            enemy.shotDelay = 0
        }
        if(enemy.shotDelay < 0){
            enemy.shotDelay = 6
            let pos ={x:enemy.pos.x,y:enemy.pos.y}
            let color = "#990000"
            let size = 25
            let lifeTime = -1
            let v = Utility.sbulletCalc(player.pos,enemy.pos)
            let speed={x:v.x*10,y:v.y*10}
            console.log(speed);
            enemy.newEnemyBullet(pos,color,size,lifeTime,speed)
        }
        enemy.shotDelay--
    }
]