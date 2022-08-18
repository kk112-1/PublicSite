import { Status, Task, TaskObject } from "./Task";
// 
const STORAGE_KEY = 'TASKS';
// タスク管理クラス
export class TaskCollection {
    // タスク配列
    private tasks: Task[] = [];
    // '
    private readonly storage;

    // コンストラクタ
    constructor() {
        this.storage = localStorage;
        this.tasks = this.getStorageTask();
    }

    // タスク追加メソッド
    add(task: Task) {
        this.tasks.push(task);
        // 
        this.updateStorage();
    }

    // タスク削除メソッド
    delete(task: Task) {
        // 引数のタスクID以外の配列の作成
        this.tasks = this.tasks.filter(({ id }) => id !== task.id);
        //
        this.updateStorage();
    }

    // タスク情報取得
    find(id: string) {
        // 
        return this.tasks.find((task) => task.id === id);
    }
    // 情報の更新
    update(task: Task) {
        this.tasks = this.tasks.map((item) => {
            if (item.id === task.id) return task;
            return item;
        });
    }

    // statusが一定のタスクリストを取得
    filter(filterStatus: Status) {
        return this.tasks.filter(({ status }) => status === filterStatus)
    }
    // 
    updateStorage() {
        // 
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    }

    // 
    getStorageTask(): Task[] {
        // 
        const jsonString = this.storage.getItem(STORAGE_KEY);
        // 
        if (!jsonString) return []
        try {
            const storagedTask = JSON.parse(jsonString);
            assertIsTaskObjects(storagedTask);
            const tasks = storagedTask.map((task) => new Task(task));

            return tasks;
        } catch (error) {
            this.storage.removeItem(STORAGE_KEY);
            return []
        }
    }
    // データ入れ替える
    moveAboveTarget (task:Task,target: Task){
        // 自分のタスクのインデックス
        const taskIndex = this.tasks.indexOf(task);
        // 兄弟のタスクのインデックス
        const targetIndex = this.tasks.indexOf(target);
        // 入れ替え処理
        this.changeOrder(task,taskIndex,taskIndex<targetIndex ? targetIndex - 1 : targetIndex);
    }
    // データを移動
    moveToLast(task:Task){
        // 最後に入れる
        const taskIndex =  this.tasks.indexOf(task);
        this.changeOrder(task,taskIndex,this.tasks.length);
    }
    // データの入れ替え処理
    changeOrder(task: Task, taskIndex: number, targetIndex: number) {
        // 削除
        this.tasks.splice(taskIndex,1);
        // 追加
        this.tasks.splice(targetIndex,0,task);
        // LocalStorageの更新
        this.updateStorage();
    }
}
function assertIsTaskObjects(value: any): asserts value is TaskObject[] {
    if (!Array.isArray(value) || !value.every((item) => Task.validate(item))) {
        throw new Error("引数「value」はTaskObject型と一致しません。");
    }
}

