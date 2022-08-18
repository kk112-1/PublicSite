import {v4 as uuid, validate} from 'uuid'

// // 本来の列挙型
// // TypeScriptの本来のコンセプトから一脱しているため、
// // 代替を利用するのが一般的。
// enum Status {
//     Todo = 'TODO',
//     Doing = 'DOING',
//     Done = 'DONE'
// }

// 列挙型の値の宣言(代替)
export const statusMap = {
    Todo:'TODO',
    Doing:'DOING',
    Done:'DONE'
};
// 列挙型の型の宣言(代替)
export type Status = typeof statusMap[keyof typeof statusMap];

// 
export type TaskObject = {
    id:string
    title:string
    status:Status
}

// タスクリストのタスクを管理するクラス。
export class Task{
    // タスクタイトル
    title:string;
    // タスクID
    readonly id:string;
    status:Status;

    // コンストラクタ
    constructor(properties:{id?:string,title:string,status?:Status}){
        // uuid生成 
        this.id = properties.id || uuid();
        this.title = properties.title;
        //
        this.status = properties.status || statusMap.Todo;
    }

    // 情報の更新
    update(properties:{title?:string;status?:Status}){
        this.title = properties.title || this.title;
        this.status = properties.status || this.status;
    }
    // 
    static validate(value :any){
        // 
        if(!value)return false;
        // 
        if(!validate(value.id))return false;
        // 
        if(!value.title)return false;
        // 
        if(!Object.values(statusMap).includes(value.status)) return false;
        // 
        return true;
    }
}