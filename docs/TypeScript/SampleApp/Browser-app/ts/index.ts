import { EventListener } from "./EventListener";
import { Status, statusMap, Task } from "./Task";
import { TaskCollection } from "./TaskCollection";
import { TaskRenderer } from "./TaskRenderer";

// アプリケーションクラス（フロントエンドのメインクラス）
class Application {

    // イベント管理クラス
    private readonly eventListener = new EventListener();
    // タスク管理クラス
    private readonly taskCollection = new TaskCollection();
    // タスク描画クラス
    private readonly taskRenderer = new TaskRenderer(
        document.getElementById('todoList') as HTMLElement,
        document.getElementById('doingList') as HTMLElement,
        document.getElementById('doneList') as HTMLElement
    );

    start() {
        //     console.log('Hello World');
        //     const eventListener = new EventListener();
        // // ボタン要素の取得
        // const button = document.getElementById('deleteAllDoneTask');
        // if(!button)return;

        // console.log(button);
        // // ボタンへのイベント付加
        // eventListener.add(
        //     'sample',
        //     'click',
        //     button,
        //     ()=>alert('clicked')
        // );
        // // ボタンへのイベント除去
        // eventListener.remove('sample');

        // 初期、描画処理
        const taskItems = this.taskRenderer.renderAll(this.taskCollection);

        // 作成フォームの取得
        const createForm = document.getElementById('createForm') as HTMLElement;

        // 各タスクのデリートボタンのイベントの設定
        taskItems.forEach(({task,deleteButtonEl}) => {
            this.eventListener.add('click',deleteButtonEl,()=>this.handleClickDeleteTask(task),task.id)
        });

        // ボタンへのイベント付加(deleteAllDoneTask)
        const deleteAllDoneTaskButton = document.getElementById('deleteAllDoneTask')as HTMLElement;
        // DONE のタスクを一括削除ボタン押下イベント付加
        this.eventListener.add('click',deleteAllDoneTaskButton,this.handleClickDeleteAllDoneTasks);
        
        // ボタンへのイベント付加(handleSubmit)
        // 作成ボタン押下イベント付加
        this.eventListener.add('submit', createForm, this.handleSubmit);
        
        // タスクのドラッグアンドドロップのイベント付加
        this.taskRenderer.subscribeDragAndDrop(this.handleDragAndDrop);
    }

    // 作成ボタン押下の処理
    private handleSubmit = (e: Event) => {
        // 画面遷移のキャンセル(本来の機能を無効化するため)
        e.preventDefault();
        // console.log('submitted');
        // タイトル要素の取得
        const titleInput = document.getElementById('title') as HTMLInputElement;
        // 存在チェック
        if (!titleInput) return;
        // ToDoリストへタスク追加
        const task = new Task({ title: titleInput.value });
        // // 生成チェック
        // console.log(task);

        // タスク管理インスタンスにタスクを追加
        this.taskCollection.add(task);


        // // タスクの追加の確認
        // console.log(this.taskCollection);

        // 描画処理＋削除ボタンの取得
        const { deleteButtonEl } = this.taskRenderer.append(task)

        // 削除ボタンのイベント設定
        this.eventListener.add(
            'click',
            deleteButtonEl,
            () => this.handleClickDeleteTask(task),
            task.id
        )

        // 入力値の初期化
        titleInput.value = '';
    }

    // 関数型の変数
    // DONE のタスクを一括で削除ボタン押下の処理
    private handleClickDeleteAllDoneTasks = () => {
        // ダイアログの表示
        if (!window.confirm(`DONE のタスクを一括で削除してもよろしいですか？`)) return;

        // statusがDoneのタスクリストを取得
        const doneTasks = this.taskCollection.filter(statusMap.Done);

        // リストをもとにタスクの削除
        doneTasks.forEach((task) => this.executeDeleteTask(task));
    }

    // タスクの削除
    executeDeleteTask = (task:Task) => {
        // イベントの削除
        this.eventListener.remove(task.id);
        // データの削除
        this.taskCollection.delete(task);
        // 描画の削除
        this.taskRenderer.remove(task);
    };

    // 削除ボタン押下時
    handleClickDeleteTask(task: Task): void {
        // ダイアログの表示
        if (!window.confirm(`「${task.title}」を削除してもよろしいですか？`)) return;
        // // 対象タスクの確認
        // console.log(task);

        // それぞれの削除処理
        // イベントの削除
        this.eventListener.remove(task.id);
        // データの削除
        this.taskCollection.delete(task);
        // 描画の削除
        this.taskRenderer.remove(task);
    }

    // 関数型の変数
    private handleDragAndDrop = (el: Element, sibling: Element | null, newStatus: Status) => {
        // タスクIDからタスクの要素を取得
        const taskId = this.taskRenderer.getId(el);
        // null型ではない事の保証
        if (!taskId) return;

        // 移動した要素自体が渡される。
        // console.log(el);
        // 移動先の兄弟要素が渡される。
        // console.log(sibling);
        // 新しい状態
        // console.log(newStatus);

        // タスクの情報を取得
        const task = this.taskCollection.find(taskId);
        // null型ではない事の保証
        if(!task)return;

        // タスク情報の更新
        task.update({status:newStatus});
        // タスク配列の更新
        this.taskCollection.update(task);

        // // 一時的に（エラーになるから。）
        // console.log(sibling);
        // 兄弟要素が居るか確認
        if(sibling){
            // 兄弟要素を取得
            const nextTaskId = this.taskRenderer.getId(sibling);
            if(!nextTaskId)return;
            const nextTask = this.taskCollection.find(nextTaskId);
            if(!nextTask)return;
            // データを入れ替える処理
            this.taskCollection.moveAboveTarget(task,nextTask);
        }else{
            // データを入れる処理
            this.taskCollection.moveToLast(task);
        }
    }
}

// ページの読み込みが完了した時のイベント
window.addEventListener('load', () => {
    // メインシステムの実行
    const app = new Application();
    app.start();
});