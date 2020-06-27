"use strict";

var $ = function (ele) {
    return ele.startsWith("#") ? document.getElementById(ele.substring(1)) : document.querySelector(ele);
};
var $All = function (ele) {
    return document.querySelectorAll(ele);
};
var filterText = "";
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * 设置一下搜索的字段，默认为 ""
 * @param {string}} text 搜索的字段
 */
function setFilterText(text) {
    filterText = text;
    update();
}

/**
 * 更新所有 todo 主要是更新按钮的状态、todo的显示状态和统计总数
 */
function update() {
    var footer = document.getElementById("footer");
    var filter = footer.querySelector('a.selected').innerText;
    // console.log(filter);
    var todoItems = $All('.todo-item');
    var leftNum = 0;
    var filterPattern = new RegExp(filterText, "gi");

    todoItems.forEach(item => {
        if (!item.querySelector('.todo-text').classList.contains("completed")) {
            leftNum++;
        }
        item.querySelectorAll('.highlight').forEach(i => {
            console.log(i.outerHTML, i.innerHTML);
            i.outerHTML = i.innerHTML;
        });
        var html = item.querySelector('.todo-text').innerHTML;
        if ((filter == 'All'
            || (filter == 'Active'    && !item.querySelector('.todo-text').classList.contains("completed")) 
            || (filter == 'Completed' && item.querySelector(".todo-text").classList.contains("completed")))
            && (html.search(filterPattern) != -1)
        ) {
            if (item.parentElement.parentElement.style.display == "none") {
                item.parentElement.parentElement.style.display = "block";
            }
            item.style.display = "flex";

            if (filterText != "") {
                item.querySelector('.todo-text').innerHTML = html.replace(filterPattern, function (match) {
                    return '<span class="highlight">' + match + "</span>"; 
                });
            }
        } else {
            item.style.display = "none";
            var todoContent = item.parentElement;
            if (todoContent.querySelectorAll('li:not([style*="display:none"]):not([style*="display: none"])').length == 0) {
                todoContent.parentElement.style.display = "none";
            }
        }
    });

    var completedNum = todoItems.length - leftNum;
    var count = document.getElementById("count");
    count.innerText = (leftNum || 'No') + (leftNum > 1 ? ' items ' : ' item ') + 'left';

    var clearCompleted = document.getElementById("clear");
    clearCompleted.style.visibility = completedNum > 0 ? 'visible' : 'hidden';

    var toggleAll = document.getElementById("toggle-all");
    toggleAll.parentElement.style.visibility = todoItems.length > 0 ? 'visible' : 'hidden';
    toggleAll.checked = todoItems.length == completedNum;
}

/**
 * 更新 todo 的完成状态
 * @param {element} item 要更新的 todo 的 DOM 元素
 */
function updateTodo(item) {
    var itemToUpdate = get(item.getAttribute("id"));
    // console.log(itemToUpdate.message);
    itemToUpdate.completed = !itemToUpdate.completed;
    console.log(itemToUpdate);
    put(itemToUpdate);
    var img = item.querySelector('.toggle img');
    var text = item.querySelector('.todo-text');
    if (img.classList.contains("completed")) {
        img.classList.remove("completed");
        text.classList.remove("completed");
    } else {
        img.classList.add("completed");
        text.classList.add("completed");
    }
    update();
}

/**
 * 初始化 todo，主要是绑定监听器
 * @param {element} item 要初始化的 todo 的 DOM 元素
 */
function initTodoItem(item) {
    item.querySelector('.toggle').addEventListener('click', function () {
        updateTodo(this.parentElement);
    });
    var startCoordinates;
    var targetElement;
    var deleted = false;
    const deviceWidth = window.screen.width;
    item.addEventListener('touchstart', function (event) {
        startCoordinates = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
        targetElement = event.currentTarget;
    }, false);
    item.addEventListener('touchmove', function (event) {
        var currCoordinates = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
        var xOffset = currCoordinates.x - startCoordinates.x;
        var yOffset = currCoordinates.y - startCoordinates.y;
        if (Math.abs(yOffset) > 5) {
            return;
        }
        if (Math.abs(xOffset) < deviceWidth * 0.3) {
            targetElement.style.transition = "all 0.2s";
            targetElement.style.left = xOffset + "px";
        } else {
            deleted = true;
            targetElement.style.transition = "all 1.2s ease-in";
            targetElement.style.left = (xOffset < 0 ? -1 : 1) * deviceWidth * 4 + "px";
        }
    }, false);
    item.addEventListener('touchend', function (event) {
        if (!deleted) {
            targetElement.style.left = 0;
        } else {
            setTimeout(function () {
                removeTodo(item);
            }, 1000);
        }
        deleted = false;
        startCoordinates = null;
        targetElement = null;
    }, false);
}

/**
 * 在页面中插入 todo 信息
 * @param {int} id 插入的 todo 的 ID，为一个当前时间的时间戳
 * @param {bool} completed 完成状态
 * @param {string} message todo文本
 * @param {string} date 日期
 * @param {array} tags todo所附带的tag
 */
function insertItemToList(id, completed, message, date, tags) {
    var text = "";
    tags.forEach(tag => {
        text += '<span>' + tag + '</span>';
        // text.replace(/>/gi, ">" + "\u200B");
    });
    text += message;
    if ($("#" + date)) {
        var todosInADay = $("#" + date);
        var todoItem = document.createElement("li");
        todoItem.classList.add("todo-item");
        // todoItem.innerHTML = [
        //     '<span class="toggle"><img></span>',
        //     '<div class= "todo-text">' + text + '</div>'
        // ].join('');
        var img = document.createElement("img");
        var toggle = document.createElement("span");
        toggle.classList.add("toggle");
        toggle.appendChild(img);
        var todoText = document.createElement("div");
        todoText.innerHTML = text;
        todoText.classList.add("todo-text");
        if (completed) {
            todoText.classList.add("completed");
            img.classList.add("completed");
        }
        todoItem.append(toggle, todoText);
        todoItem.setAttribute("id", id);
        todosInADay.querySelector('.todo-content').appendChild(todoItem);
        new TagsInput(todoText);
        initTodoItem(todoItem);
    } else {
        var allTodos = $All('.todos-in-a-day');
        var todosInADay = document.createElement("li");
        todosInADay.setAttribute("id", date);
        todosInADay.classList.add("todos-in-a-day");
        // todosInADay.innerHTML = [
        //     '<div class="todo-date">' + date + '</div>',
        //     '<ul class="todo-content">',
        //     '    <li class="todo-item">',
        //     '        <span class="toggle"><img></span>',
        //     '        <div class="todo-text">' + text + '</div>',
        //     '    </li>',
        //     '</ul>'
        // ].join('');
        var nowTime = new Date().getTime();
        var eleTime = new Date(date).getTime();
        var deltaDay = (eleTime - nowTime) / MILLISECONDS_PER_DAY;
        var todoDate = document.createElement("div");
        todoDate.classList.add("todo-date");
        todoDate.innerHTML = date;
        if (deltaDay < -1) {
            todoDate.classList.add("expired");
        } else if (deltaDay < 2) {
            todoDate.classList.add("urgent");
        } else {
            todoDate.classList.add("adequate");
        }
        var todoContent = document.createElement("div");
        todoContent.classList.add("todo-content");
        var todoItem = document.createElement("li");
        todoItem.classList.add("todo-item");
        var img = document.createElement("img");
        var toggle = document.createElement("span");
        toggle.classList.add("toggle");
        toggle.appendChild(img);
        var todoText = document.createElement("div");
        todoText.innerHTML = text;
        todoText.classList.add("todo-text");
        if (completed) {
            todoText.classList.add("completed");
            img.classList.add("completed");
        }
        todoItem.append(toggle, todoText);
        todoItem.setAttribute("id", id);
        todoContent.appendChild(todoItem);
        todosInADay.append(todoDate, todoContent);
        // $("#todo-list").appendChild(todosInADay);
        // console.log(typeof allTodos);
        // allTodos.sort(function (a, b) {
        //     let aDate = new Date(a.getAttribute("id"));
        //     let bDate = new Date(b.getAttribute("id"));
        //     return aDate.getTime() - bDate.getTime();
        // });
        if (allTodos.length == 0) {
            $("#todo-list").appendChild(todosInADay);
        } else {
            var newDate = new Date(date);
            var minTimestamp = Number.MAX_SAFE_INTEGER;
            var minDate;
            allTodos.forEach(item => {
                let currDate = new Date(item.getAttribute("id"));
                if (newDate.getTime() < currDate.getTime()) {
                    var newTimestamp = currDate.getTime() - newDate.getTime();
                    if (newTimestamp < minTimestamp) {
                        minTimestamp = newTimestamp;
                        minDate = item;
                    }
                }
            });
            if (minTimestamp == Number.MAX_SAFE_INTEGER) {
                $("#todo-list").appendChild(todosInADay);
            } else {
                $("#todo-list").insertBefore(todosInADay, minDate);
            }
        }
        new TagsInput(todoText);
        initTodoItem(todoItem);
    }
    update();
}

/**
 * 在 local storage 和页面中插入 todo
 * @param {string} message 文本
 * @param {string} date 日期
 * @param {array} tags 存tag的数组
 */
function addTodo(message, date, tags) {
    var id = new Date().getTime();
    var itemToAdd = {};
    itemToAdd.id = id;
    itemToAdd.completed = false;
    itemToAdd.date = date;
    itemToAdd.message = message;
    itemToAdd.tags = tags;
    // console.log(itemToAdd);
    insert(itemToAdd);
    // console.log(tags);
    insertItemToList(id, false, message, date, tags);
}

/**
 * 删除 todo
 * @param {element} item 要删除的 DOM 元素
 */
function removeTodo(item) {
    remove(item.getAttribute("id"));
    var todoContent = item.parentElement;
    var todosInADay = todoContent.parentElement;
    var todoList = todosInADay.parentElement;
    if (todoContent.querySelectorAll('li').length > 1) {
        todoContent.removeChild(item);
    } else {
        todoList.removeChild(todosInADay);
    }
    update();
}

window.onload = function () {
/** Dark mode */
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        if (confirm("检测到深色主题，是否采用深色模式？") == true) {
            const link = document.createElement("link");
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = 'css/dark.css';
            document.head.appendChild(link);
        }
    }

/** Init local Storage */
    initStorage();

/** Init header */
    var _ = new TagsInput('.tags-input');
    var datePicker = document.getElementById("input-date");
    datePicker.valueAsDate = new Date();

/** Init todo list from local storage */
    var todoItems = getAllTodos();
    todoItems.forEach(item => {
        // console.log(item.id, item.completed, item.message, item.date, item.tags);
        insertItemToList(item.id, item.completed, item.message, item.date, item.tags);
    });

/** Init filters */
    var footer = document.getElementById("footer");
    var filters = footer.querySelectorAll('a');
    filters.forEach(filter => {
        filter.addEventListener('click', function () {
            filters.forEach(f => {
                f.classList.remove("selected");
            });
            filter.classList.add("selected");
            update();
        });
    });

/** Init `clear completed` button */
    var clearCompleted = document.getElementById("clear");
    clearCompleted.addEventListener('click', function () {
        var todoItems = document.querySelectorAll(".todo-item");
        todoItems.forEach(item => {
            if (item.querySelector(".todo-text").classList.contains("completed")) {
                remove(item.id);
                var todoContent = item.parentElement;
                var todosInADay = todoContent.parentElement;
                var todoList = todosInADay.parentElement;
                if (todoContent.querySelectorAll('li').length > 1) {
                    todoContent.removeChild(item);
                } else {
                    todoList.removeChild(todosInADay);
                }
            }
        });
        update();
    });

/** Init `toggle all` button */
    var toggleAll = document.getElementById("toggle-all");
    toggleAll.addEventListener("click", function () {
        var todoItems = document.querySelectorAll(".todo-item");
        // console.log(this.checked);
        if (!this.checked) {
            this.checked = true;
            updateCompletedState(true);
            // console.log(this.checked);
            todoItems.forEach(item => {
                item.querySelector('.toggle img').classList.remove("completed");
                item.querySelector(".todo-text").classList.remove("completed");
            });
        } else {
            this.checked = false;
            updateCompletedState(false);
            todoItems.forEach(item => {
                if (!item.querySelector(".todo-text").classList.contains("completed")) {
                    item.querySelector('.toggle img').classList.add("completed");
                    item.querySelector(".todo-text").classList.add("completed");
                }
            });
        }
        update();
    });
};