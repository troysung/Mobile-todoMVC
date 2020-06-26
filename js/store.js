"use strict";

const key = "myTodos";

function initStorage() {
    // if (!window.localStorage) {
    //     alert("Your device does not support local storage!");
    // }
    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '[]');
    }
}

function insert(todo) {
    var todos = JSON.parse(localStorage.getItem(key));
    todos.push(todo);
    localStorage.setItem(key, JSON.stringify(todos));
}

function remove(todoId) {
    var todos = JSON.parse(localStorage.getItem(key));
    todos.forEach((todo, index, arr) => {
        if (todo.id == todoId) {
            arr.splice(index, 1);
        }
    });
    localStorage.setItem(key, JSON.stringify(todos));
}

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

function getAllTodos() {
    return JSON.parse(localStorage.getItem(key));
}

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

function updateCompletedState(isCompleted) {
    var todos = JSON.parse(localStorage.getItem(key));
    todos.forEach(todo => {
        todo.completed = isCompleted;
    });
    localStorage.setItem(key, JSON.stringify(todos));
}
