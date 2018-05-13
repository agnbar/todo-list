document.addEventListener("DOMContentLoaded", function(event) {
  var addTodoInput = document.querySelector('#todo-input'),
      addTodoBtn = document.querySelector('#add-todo-btn');

  addTodoBtn.addEventListener('click', function(event) {
    var inputValue = addTodoInput.value;
    alert(inputValue);
  });
});

function Todo(description) {
  this.id = Todo.UID++;
  this.description = description;
  this.isCompleted = false;
}

Todo.UID = 1;
