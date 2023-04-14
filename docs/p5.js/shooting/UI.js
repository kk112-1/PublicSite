const UIControl = (props) => {
    const [power, setPower] = React.useState(0)
    const [score,setScore] = React.useState(0)

    let UIStatus = {}
    let UIPStatus = {}
    UIStatus["Powers"] = UIPStatus        
    UIStatus["power"] = {get:power,set:setPower}
    UIStatus["score"] = {get:score,set:setScore}
    props.UIStatus(UIStatus)

    // 要素を作成(DOM要素)
    let element = (
    <div style={{float:'right'}} id="UIRoot">
        <div><label htmlFor="score">スコア</label><input type="text" name="score" id="score" value={score} disabled /></div>
        <div><label htmlFor="autoshot">オートショット</label><input type="checkbox" name="autoshot" id="autoshot" onChange={HtmlController.controllerChange} data-checked="false" /></div>
        <PowerUp power={power} UIPStatus={UIPStatus} />
    </div>
    )
    return element
}

UIControl.run = (setUIStatus) => {
    let dom = document.querySelector('#UIRoot');
    let root = ReactDOM.createRoot(dom);
    let element = (<UIControl UIStatus={setUIStatus}/>)
    // 描画
    root.render(element);
}

const PowerUp = (props) => {
    const [power, setPower] = React.useState(0)
    const [speed, setSpeed] = React.useState(0)
    
    props.UIPStatus["power"] = {get:power,set:setPower}
    props.UIPStatus["speed"] = {get:speed,set:setSpeed}

    let elements = [
        (
        <div id="power-0">
            <h1 style={{fontSize:"24px"}}>スコアパワーアップメニュー</h1>
            <div>
                <input type="button" id="ImplementSpeedMenue" value="スピード" onClick={HtmlController.controllerChange}/>:100Point<br />
                {/* <input type="button" id="ImplementPowerMenue" value="パワーコントローラー" onClick={HtmlController.controllerChange}/>:100Point<br /> */}
            </div>
        </div>
        ),(
        <div id="power-1">
            <div><label htmlFor="speedChange">スピード</label><input type="range" name="speedChange" id="speedChange" min="0" max="10" step="1" defaultValue="5"  onChange={HtmlController.controllerChange} /></div>
            <div>スピード：{speed}</div>
        </div>
        ),(
        <div id="power-2">
            <div><label htmlFor="level">パワーコントローラー</label><input type="range" name="speedChange" id="speedChange" min="0" max="10" step="1" defaultValue="5"  onChange={HtmlController.controllerChange} /><br />
            パワー：{power}<br />
            <input type="text" name="level" id="level" disabled /></div>
            <div><input type="button" name="levelup" value="レベルアップ" onClick={HtmlController.controllerChange} /><label htmlFor="level">コスト</label><input type="text" name="levelcost" id="levelcost" disabled /></div>
        </div>
        )
    ]
    let element = (
        <div>
            {(props.power&(1<<0))> 0 && elements[0]}
            {(props.power&(1<<1))> 0 && elements[1]}
            {(props.power&(1<<2))> 0 && elements[2]}
        </div>
    )
    return element
}

// リアクトを外部から操作するためのクラス
class UIControlInterface{
    static powerChange
    static Status
    static run(){
        this.powerChange = (num) =>{
            if((this.Status.power.get&(1<<num))==0){
                this.Status.power.set(this.Status.power.get | (1<<num))
                return true
            }
            return false
        }
        let setUIStatus = (UIStatus) =>{
            this.Status = UIStatus
        }
        UIControl.run(setUIStatus)
    }
}
UIControlInterface.run()
