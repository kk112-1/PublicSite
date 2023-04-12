const UIControl = (props) => {
    const [power, setPower] = React.useState(0)
    props.pow(setPower)
    let a
    // 要素を作成(DOM要素)
    let element = (
    <div style={{float:'right'}} id="UIRoot">
        <div><label htmlFor="score">スコア</label><input type="text" name="score" id="score" value="0" disabled /></div>
        <div><label htmlFor="autoshot">オートショット</label><input type="checkbox" name="autoshot" id="autoshot" onChange={HtmlController.controllerChange} data-checked="false" /></div>
        <PowerUp power={power}/>
    </div>
    )
    return element
}

UIControl.run = (pow) => {
    let dom = document.querySelector('#UIRoot');
    let root = ReactDOM.createRoot(dom);
    let element = (<UIControl pow={pow}/>)
    // 描画
    root.render(element);
}

const PowerUp = (props) => {
    let elements = [
        (
        <div id="power-0">
            <div><label htmlFor="level">パワーレベル</label><input type="text" name="level" id="level" disabled /></div>
            <div><input type="button" name="levelup" value="レベルアップ" onClick={HtmlController.controllerChange} /><label htmlFor="level">コスト</label><input type="text" name="levelcost" id="levelcost" disabled /></div>
        </div>
        ),(
        <div id="power-1">
            <div><label htmlFor="speedChange">スピード</label><input type="range" name="speedChange" id="speedChange" min="0" max="10" step="1" defaultValue="5"  onChange={HtmlController.controllerChange} /></div>
        </div>
        ),(
        <div id="power-2">
            <div><label htmlFor="level">パワーレベル2</label><input type="text" name="level" id="level" disabled /></div>
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
    static run(){
        let pow = (pow)=> {
            this.powerChange = pow
        }
        UIControl.run(pow)
    }
}
UIControlInterface.run()