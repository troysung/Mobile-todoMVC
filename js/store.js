"use strict";

const key = "myTodos";

/**
 * 初始化 local storage，如果没有 key 对应的信息就创建一个
 */
function initStorage() {
    // if (!window.localStorage) {
    //     alert("Your device does not support local storage!");
    // }
    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '[]');
    }
}

/**
 * 向 local storage 插入一条 todo 信息
 * @param {object} todo 一条todo信息，包括文本, tags, deadline, id, message 五个字段 
 */
function insert(todo) {
    var todos = JSON.parse(localStorage.getItem(key));
    todos.push(todo);
    localStorage.setItem(key, JSON.stringify(todos));
}

/**
 * 在 local storage 中删除指定 id 的记录
 * @param {int} todoId 要删除的 todo 的 id
 */
function remove(todoId) {
    var todos = JSON.parse(localStorage.getItem(key));
    todos.forEach((todo, index, arr) => {
        if (todo.id == todoId) {
            arr.splice(index, 1);
        }
    });
    localStorage.setItem(key, JSON.stringify(todos));
}

/**
 * 获取一条 todo 信息
 * @param {int} id todo 的 id
 */
function get(id) {
    var todos = JSON.parse(localStorage.getItem(key));
    var todoItem;
    todos.forEach(todo => {
        if (todo.id == id) {
            todoItem = todo;
        }
    });
    return todoItem;
}

/**
 * 获取所有 todo 信息
 */
function getAllTodos() {
    return JSON.parse(localStorage.getItem(key));
}

/**
 * 修改一条 todo 信息
 * @param {object} item 修改后的 todo 信息
 */
function put(item) {
    var todos = JSON.parse(localStorage.getItem(key));
    todos.forEach(todo => {
        if (todo.id == item.id) {
            todo.completed = item.completed;
            todo.date = item.date;
            todo.message = item.message;
            todo.tags = item.tags;
        }
    });
    localStorage.setItem(key, JSON.stringify(todos));
}

/**
 * 更新所有 todo 的完成状态
 * @param {bool} isCompleted 是否完成
 */
function updateCompletedState(isCompleted) {
    var todos = JSON.parse(localStorage.getItem(key));
    todos.forEach(todo => {
        todo.completed = isCompleted;
    });
    localStorage.setItem(key, JSON.stringify(todos));
}
