class Task{
  constructor() {
    this.id = nextTaskId++;
    this.title = '';
    this.description = '';
    this.duedate = '';
    this.prio = 0;
    this.isdone = false;
  }
}

const tasksList = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const addButton = document.getElementById('add-todo-btn');
const sortButton = document.getElementById('sort-btn');
const filterButtons = document.getElementById('filter-btns');
let nextTaskId = 0;
let objTasksData = {};
let strTaskData = '';
let getReq = new XMLHttpRequest();
let deleteReq = new XMLHttpRequest();
let changeReq = new XMLHttpRequest();

function displayTask(task) {
  let newLiElement = document.createElement('li');
  newLiElement.setAttribute('task-id', task.id.toString());
  newLiElement.setAttribute('task-prio', task.prio.toString());
  newLiElement.setAttribute('task-isdone', task.isdone.toString());
  newLiElement.className = 'row';
  let titleElem = document.createElement('div');
  titleElem.className = 'col-sm-6';
  titleElem.innerHTML = '<p>' + task.title + '<br />' + task.description + '</p>';
  let prioElement = document.createElement('div');
  prioElement.className = 'col-sm-1';
  prioElement.innerHTML = '<p>' + task.prio + '</p>';
  let dateElement = document.createElement('div');
  dateElement.className = 'col-sm-2';
  dateElement.innerHTML = '<p>'  + task.duedate + '</p>';
  let checkBlockElem = document.createElement('div');
  checkBlockElem.className = 'col-sm-1';
  let checkElem = document.createElement('input');
  checkElem.type = 'checkbox';
  checkElem.checked = task.isdone;
  checkElem.setAttribute('task-id', task.id.toString());
  checkBlockElem.appendChild(checkElem);
  let buttonBlockElem = document.createElement('div');
  buttonBlockElem.className = 'col-sm-2';
  let buttonElem = document.createElement('button');
  buttonElem.type = 'submit';
  buttonElem.className = 'btn btn-block btn-danger';
  buttonElem.textContent = 'Usuń';
  buttonElem.setAttribute('task-id', task.id.toString());
  buttonBlockElem.appendChild(buttonElem);
  newLiElement.appendChild(titleElem);
  newLiElement.appendChild(prioElement);
  newLiElement.appendChild(dateElement);
  newLiElement.appendChild(checkBlockElem);
  newLiElement.appendChild(buttonBlockElem);
  tasksList.appendChild(newLiElement);
}

function listActionHandler() {
  const clickType = event.target.type;
  switch(clickType){
    case 'submit':
      deleteTask(event.target);
      break;
    case 'checkbox':
      changeTaskStatus(event);
      break;
    default:
      break;
  }
}

function deleteTask(target) {
  const taskToDeleteId = target.getAttribute('task-id');
  let i;
  for(i=0; objTasksData.tasks.length; i++) {
    if(objTasksData.tasks[i].id == taskToDeleteId) {
      const liToDelete = document.getElementsByTagName("li")[i];
      const old = tasksList.removeChild(liToDelete);
      objTasksData.tasks.splice(i, 1);
      deleteReq.open('DELETE', 'http://localhost:3000/tasks/'+taskToDeleteId, true);
      deleteReq.send();
      break;
    }
  }
}

function changeTaskStatus(event) {
  const taskToChangeId = event.target.getAttribute('task-id');
  let i;
  event.path[2].setAttribute('task-isdone', event.target.checked.toString());
  for(i=0; objTasksData.tasks.length; i++) {
    if(objTasksData.tasks[i].id == taskToChangeId) {
        objTasksData.tasks[i].isdone = event.target.checked;
        strTaskData = JSON.stringify(objTasksData.tasks[i]);
        changeReq.open('PUT', 'http://localhost:3000/tasks/'+taskToChangeId, true);
        changeReq.setRequestHeader('Content-type','application/json; charset=utf-8');
        changeReq.send(strTaskData);
        break;
      }
  }
}

function formatDate(dateObj) {
  let dateFormatted;
  let dd = dateObj.getDate();
  let mm = dateObj.getMonth() + 1;
  const yyyy = dateObj.getFullYear();
  if(dd < 10) {
      dd = '0' + dd;
  }
  if(mm < 10) {
      mm = '0' + mm;
  }
  dateFormatted = yyyy + '-' + mm + '-' + dd;
  return dateFormatted;
}

function getDataFromDOM(task) {
  task.title = document.getElementById('task-title').value;
  if (document.getElementById('task-description').value !== '') {
    task.description = document.getElementById('task-description').value;
  }
  if (document.getElementById('task-duedate').value !== '') {
    task.duedate = document.getElementById('task-duedate').value;
  }
  if (document.getElementById('task-prio').value !== '') {
    task.prio = document.getElementById('task-prio').value;
  }
}

function filterTasks(event) {
  let b;
  let i;
  b = tasksList.getElementsByTagName('LI');

  switch(event.target.id) {
    case 'filter-completed-btn':
      console.log('completed - entered!');
      for(i=0; i<b.length; i++) {
        if (b[i].getAttribute('task-isdone') === 'true') {
          b[i].style.display = "";
        } else {
          b[i].style.display = "none";
        }
      }
      break;
    case 'filter-not-completed-btn':
      console.log('todo - entered!');
      for(i=0; i<b.length; i++) {
        if (b[i].getAttribute('task-isdone') === 'true') {
          b[i].style.display = "none";
        } else {
          b[i].style.display = "";
        }
      }
      break;
    case 'filter-all-btn':
      console.log('all - entered!');
      for(i=0; i<b.length; i++) {
        b[i].style.display = "";
      }
      break;
  }
}

document.getElementById('task-duedate').valueAsDate = new Date();

getReq.open('GET', 'tasks.json', true);
getReq.onload = function() {
  let i;
  objTasksData = JSON.parse(getReq.responseText);
  for (i = 0; i < objTasksData.tasks.length; i++) {
    displayTask(objTasksData.tasks[i]);
  }
  nextTaskId = objTasksData.tasks[i-1].id + 1;
};
getReq.send();

addButton.addEventListener('click', function(event){
  let newTask = new Task();
  getDataFromDOM(newTask);
  objTasksData.tasks.push(newTask);
  strTaskData = JSON.stringify(newTask);
  displayTask(newTask);
  let addReq = new XMLHttpRequest();
  addReq.open('POST', 'http://localhost:3000/tasks/', true);
  addReq.setRequestHeader('Accept', 'application/json');
  addReq.setRequestHeader('Content-Type', 'application/json');
  addReq.send(strTaskData);
});

tasksList.addEventListener('click', listActionHandler);

sortButton.addEventListener('click', function(event){
  let b;
  let switchNodes = true;
  let i;

  b = tasksList.getElementsByTagName('LI');

  while(switchNodes) {
    switchNodes = false;
    for(i=1; i<b.length; i++) {
      if(b[i].getAttribute('task-prio') < b[i-1].getAttribute('task-prio')) {
        switchNodes = true;
        b[i].parentNode.insertBefore(b[i], b[i-1]);
        break;
      }
    }
  }

});

filterButtons.addEventListener('click', filterTasks);

searchInput.addEventListener('keyup', function() {
  let searchFraze;
  let li;
  let p;
  let i;
  searchFraze = searchInput.value.toUpperCase();
  li = tasksList.getElementsByTagName('li');

  for (i = 0; i < li.length; i++) {
    p = li[i].getElementsByTagName("p")[0];
    if (p.innerHTML.toUpperCase().indexOf(searchFraze) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
})
