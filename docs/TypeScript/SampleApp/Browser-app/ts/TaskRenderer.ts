import dragula from "dragula";
import { Status, statusMap, Task } from "./Task";
import { TaskCollection } from "./TaskCollection";

// タスク描画クラス
export class TaskRenderer {
    // todoリストの要素(親)
    private readonly todoList: HTMLElement;
    private readonly doingList: HTMLElement;
    private readonly doneList: HTMLElement;

    // コンストラクタで親となる要素の取得
    constructor(todoList: HTMLElement, doingList: HTMLElement, doneList: HTMLElement) {
        this.todoList = todoList;
        this.doingList = doingList;
        this.doneList = doneList;
    }

    // 全タスクリストを描画する処理
    renderAll(taskCollection:TaskCollection){
        // タスクデータを取得しながら描画処理を行う。
        const todoTasks = this.renderList(taskCollection.filter(statusMap.Todo),this.todoList);
        const doingTasks = this.renderList(taskCollection.filter(statusMap.Doing),this.doingList);
        const doneTasks = this.renderList(taskCollection.filter(statusMap.Done),this.doneList);
        // タスクデータを複数の配列から一つの配列に変換している。
        return [...todoTasks,...doingTasks,...doneTasks];
    }

    // 各タスクリストの描画処理
    renderList(tasks: Task[], listEl: HTMLElement) {
        // 配列の要素が0でない時
        if(tasks.length === 0)return [];
        // オブジェクト型を指定した空の配列の宣言
        const taskList:Array<{
            task:Task
            deleteButtonEl: HTMLButtonElement
        }> = [];

        // データを基に描画を行う。
        tasks.forEach((task) => {
            const {taskEl,deleteButtonEl} = this.render(task);
            // 描画
            listEl.append(taskEl);
            // データ
            taskList.push({task,deleteButtonEl});
        });
        return taskList;
    }
    

    // タスクの追加メソッド
    append(task: Task) {
        // 描画メソッドの呼び出し
        const { taskEl, deleteButtonEl } = this.render(task);
        // 描画準備できた要素をtodoリストに追加する。
        this.todoList.append(taskEl);
        // 削除ボタンの要素を返す
        return { deleteButtonEl };
    }

    // 描画メソッド
    render(task: Task) {
        // div 要素の作成
        const taskEl = document.createElement('div');
        // span 要素の作成
        const spanEl = document.createElement('span');
        // button 要素の作成
        const deleteButtonEl = document.createElement('button');

        // idの登録
        taskEl.id = task.id;
        // classの指定
        taskEl.classList.add('task-item');

        // 表示内容の指定（タイトルの描画）
        spanEl.textContent = task.title;

        // 削除ボタンの追加
        deleteButtonEl.textContent = '削除';

        // タスク要素のそれぞれの要素を子供として追加
        taskEl.append(spanEl, deleteButtonEl);

        // タスク要素を返す
        return { taskEl, deleteButtonEl };
    }

    // 描画された要素の削除
    remove(task: Task) {
        // 要素の取得
        const taskEl = document.getElementById(task.id);
        //要素が存在しない場合
        if (!taskEl) return;

        // 
        switch (task.status) {
            case statusMap.Todo:
                // 子要素の削除
                this.todoList.removeChild(taskEl);
                break;
            case statusMap.Doing:
                // 子要素の削除
                this.doingList.removeChild(taskEl);
                break;
            case statusMap.Done:
                // 子要素の削除
                this.doneList.removeChild(taskEl);
                break;
        }


    }

    subscribeDragAndDrop(onDrop: (el: Element, sibling: Element | null, newStatus: Status) => void) {
        dragula([this.todoList, this.doingList, this.doneList]).on('drop', (el, target, _source, sibling) => {
            // 移動した要素自体が渡される。
            console.log(el);
            // 移動先の親要素が渡される。
            console.log(target);
            // 移動する前の親要素が渡される。
            console.log(_source);
            // 移動先の兄弟要素が渡される。
            console.log(sibling);

            // 状態更新
            let newStatus: Status|null = null;;
            switch (target.id) {
                case 'todoist':
                    newStatus = statusMap.Todo
                    break;
                case 'doingList':
                    newStatus = statusMap.Doing
                    break;
                case 'doneList':
                    newStatus = statusMap.Done
                    break;
            }
            
            // null型ではない事を保証出来る。
            if(!newStatus)return;

            // コールバックメソッドの呼び出し
            onDrop(el, sibling, newStatus);
        });
    }

    // 
    getId(el: Element) {
        return el.id;
    }
}