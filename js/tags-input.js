/**
 * 输入 tag
 * @param {DOM Element} element 绑定到的 DOM 元素
 */
var TagsInput = function (element) { 
    var self = this;
    var initChar = "\u200B"; // Zero width space
    var initCharPattern = new RegExp(initChar, 'g');
  
    var insert = function(element) {
        if (self.textNode) {
            self.element.insertBefore(element, self.textNode);
        } else {
            self.element.appendChild(element);
        }
    };

    var updateCursor = function () {
        self.cursor = self.blank;
    };
    
    var keydown = function (event) {
        // event.Key == enter
        if (event.keyCode == 13) {
            event.preventDefault();
            setTimeout(function () {
                var text = self.text;
                if (!text) {
                    return;
                }
                if (element.className.match(/\btags-input\b/)) {
                    // console.log(text.replace(initCharPattern, '')[0]);
                    // Filter
                    if (text.replace(initCharPattern, '').startsWith("?")
                        && self.element.querySelectorAll('span').length == 0) {
                        setFilterText(text.replace(initCharPattern, '').slice(1));
                    } else {
                        setFilterText("");
                        if (text != "") {
                            self.text = initChar;
                            var tags = [];
                            var date = document.getElementById("input-date").value;
                            self.element.querySelectorAll('.tags-input span').forEach(tag => {
                                tags.push(tag.innerText);
                                self.element.removeChild(tag);
                            });
                            addTodo(text, date, tags);
                        }
                    }
                } else {
                    self.element.setAttribute('contenteditable', 'false');
                    self.element.removeEventListener('keydown', keydown);
                    self.element.removeEventListener('focus', focus);
                    self.element.classList.remove("editing")
                    // console.log(self.element.parentElement.getAttribute("id"));
                    var todoToUpdate = get(self.element.parentElement.getAttribute("id"));
                    var updatedTags = [];
                    self.element.querySelectorAll('span').forEach(tag => {
                        updatedTags.push(tag.innerText);
                    });
                    // console.log(todoToUpdate);
                    todoToUpdate.tags = updatedTags;
                    todoToUpdate.message = text;
                    put(todoToUpdate);
                }
            }, 1);
        }
        // event.Key == comma
        else if (event.keyCode == 188) {
            event.preventDefault();
            setTimeout(function() {
                var text = self.text;
                if (text) {
                    self.text = initChar;
                    self.add(text);
                }
            }, 1);
        }
        // event.Key == Backspace
        else if(event.keyCode == 8) {
            if(self.text.replace(initCharPattern, '') == '') {
                self.text = initChar + initChar;
                if (self.selected) {
                    self.element.removeChild(self.selected);
                } else {
                    // var tags = self.tags;
                    // var keys = Object.keys(tags)
                    // if (keys.length > 0) {
                    //     var tag = tags[keys[keys.length-1]];
                    //     tag.setAttribute('data-selected', '');
                    // }
                    var elements = self.element.querySelectorAll('span');
                    if (elements.length > 0) {
                        var tag = elements[elements.length - 1];
                        tag.setAttribute('data-selected', '');
                    }
                }
            }
        }
        if(event.keyCode !== 8) {
            if(self.selected) self.selected.removeAttribute('data-selected');
        }
        setTimeout(function() {
            updateCursor();
        }, 1);
    };
    
    var focus = function() {
        updateCursor();
    };
    
    Object.defineProperties(this, {
        element: {
            get: function() {
                return element;
            },
            set: function (v) {
                // if (typeof v == 'string') {
                //     v = document.querySelector(v);
                // }
                // element = v instanceof Node ? v : document.createElement('div');
                element = v instanceof Node ? v : document.querySelector(v);
                if (element.className.match(/\btags-input\b/)) {
                    if (element.getAttribute('contenteditable') != 'true') {
                        element.setAttribute('contenteditable', 'true');
                    }
                    element.removeEventListener('keydown', keydown);
                    element.addEventListener('keydown', keydown);

                    element.removeEventListener('focus', focus);
                    element.addEventListener('focus', focus);
                    // element.querySelectorAll("span").forEach(tag => {
                    //     self.add(tag.innerText);
                    //     tag.parentNode.removeChild(tag);
                    // });
                    // this.text = initChar + element.innerHTML.split(">")[element.innerHTML.split(">").length - 1];
                    this.text = initChar;
                } else {
                    element.querySelectorAll("span").forEach(tag => {
                        tag.setAttribute('contenteditable', 'false');
                    });
                    // element.addEventListener('dblclick', function () {
                        // this.setAttribute('contenteditable', 'true');
                        // element.removeEventListener('keydown', keydown);
                        // element.addEventListener('keydown', keydown);

                        // element.removeEventListener('focus', focus);
                        // element.addEventListener('focus', focus);
                    // });
                    // Add custom double click listener for todo detail
                    // var todoDetail = todoItem.querySelector('.todo-detail');
                    var touch1, touch2;
                    var clicked = 1;
                    element.addEventListener('click', function () {
                        if (clicked == 1) {
                            touch1 = new Date().getTime();
                            clicked++;
                        } else if (clicked == 2) {
                            touch2 = new Date().getTime();
                            if (Math.abs(touch2 - touch1) < 500) {
                                this.setAttribute('contenteditable', 'true');
                                element.removeEventListener('keydown', keydown);
                                element.addEventListener('keydown', keydown);

                                element.removeEventListener('focus', focus);
                                element.addEventListener('focus', focus);
                                element.classList.add("editing");
                                clicked = 1;
                            } else {
                                touch1 = new Date().getTime();
                            }
                        }
                    }, false);
                    this.text = initChar + initChar + element.innerHTML.split(">")[element.innerHTML.split(">").length - 1];
                }
            }
        },
        tags: {
            get: function() {
                var element;
                var elements = this.element.querySelectorAll('span');
                var tags = {};
                for(var i = 0; i < elements.length; i++) {
                    element = elements[i];
                    tags[element.innerText] = element;
                }
                
                return tags;
            }
        },
        lastChild: {
            get: function() {
                return this.element.lastChild;
            }
        },
        textNode: {
            get: function() {
                return this.element.lastChild instanceof Text ? this.element.lastChild : null;
            }
        },
        text: {
            get: function() {
                return this.textNode ? this.textNode.data : null;
            },
            set: function(v) {
                if(!this.textNode) this.element.appendChild(document.createTextNode(','));
                this.textNode.data = v;
            },
        },
        cursor: {
            get: function() {
                return this.element.getAttribute('data-cursor') !== null;
            },
            set: function(v) {
                if(v) this.element.setAttribute('data-cursor', '');
                else this.element.removeAttribute('data-cursor');
            }
        },
        focused: {
            get: function() {
                return document.activeElement == this.element;
            }
        },
        blank: {
            get: function() {
                return this.text.replace(initCharPattern, '') == '';
            }
        },
        selected: {
            get: function() {
                return this.element.querySelector('span[data-selected]');
            }
        }
    });
  
    this.add = function(tag) {
        tag = tag.replace(initCharPattern, '');
        tag = tag.replace(/^\s+/, '').replace(/\s+$/, '');
        tag = tag[0].toUpperCase()+tag.toLowerCase().slice(1);
        if(tag != '' && this.tags[tag] === undefined) {
            var element = document.createElement('span');
            element.appendChild(document.createTextNode(tag));
            element.setAttribute('contenteditable', 'false');
            
            insert(element);
        }
    };
  
    this.remove = function(tag) {
        var element = this.tags[tag];
        if(element) this.element.removeChild(element);
    };
    
    this.element = element;
};