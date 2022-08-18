import {v4 as uuid} from 'uuid'

// 汎用的な型の分岐の宣言
// ジェネリクス型で指定されている型で判定を行い、型を分岐する。
type Handler<T> = T extends keyof HTMLElementEventMap ? (e:HTMLElementEventMap[T]) => void : (e:Event) =>void;


// イベントを一括管理するための型(配列で宣言するのでその要素になる。)
type Listeners = {
    [id:string]:{
        event:string
        element:HTMLElement
//        handler:(e:Event) =>void
        handler:Handler<string>
    }
}

// イベントを一括管理するためのクラス
export class EventListener{
    // イベントの管理オブジェクト
    private readonly listener:Listeners={}

    // イベント追加メソッド
    // listenerId:UUID
    // event:イベント名(トリガー名)
    // element:イベントを追加する要素
    // handler:イベント発生時の処理内容(関数)
    add<T extends string>(event:T,element:HTMLElement,handler:Handler<T>,listenerId = uuid()){
        // 情報を保存
        this.listener[listenerId] = {
            event,
            element,
            handler
        };
        // イベントを追加
        element.addEventListener(event,handler);
    }

    // イベント除去メソッド
    remove(listenerId:string){
        // 保存した情報をもとに検索
        const listener = this.listener[listenerId];
        if(!listener)return;
        // 保存した情報をもとにイベントを削除
        listener.element.removeEventListener(listener.event,listener.handler);
        // 保存した情報を削除
        delete this.listener[listenerId];
    }
}