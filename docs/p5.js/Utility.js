export class Utility{
    static sbulletCalc(pos1,pos2){
        let posd = {x:0,y:0}
        posd.x = pos1.x - pos2.x
        posd.y = pos1.y - pos2.y
        let posdSum = abs(posd.x) + abs(posd.y)
        let posdRate = {x:posd.x/posdSum,y:posd.y/posdSum}
        return posdRate
    }
}
