// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
    let id = nextId;
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return id;
}

// Function to create a task card with conditional styling based on due date
function createTaskCard(task) {
  const dueDate = dayjs(task.dueDate);
  const currentDate = dayjs();
  const daysDifference = dueDate.diff(currentDate, 'day');
  
  let dueClass = '';

  if (daysDifference < 0) {
      dueClass = 'bg-past-due text-white'; // PAST DUE
  } else if (daysDifference <=1) {
    dueClass = 'bg-danger text-dark'; // COLOUR IF DUE WITHIN A DAY
  }
  else if (daysDifference <= 2) {
      dueClass = 'bg-warning text-dark'; // COLOUR IF DUE WITHIN 3 DAYS
  } else {
      dueClass = 'bg-success text-white'; // DUE LATER
  }

  return `
      <div class="task-card card mb-3 ${dueClass}" data-id="${task.id}">
          <div class="card-body">
              <h5 class="card-title">${task.title}</h5>
              <p class="card-text">${task.description}</p>
              <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
              <button class="btn btn-danger delete-task">Delete</button>
          </div>
      </div>
  `;
}

// RENDERS THE TASK LIST AND MAKES THEM DRAGGABLE

function renderTaskList() {
    ['todo', 'in-progress', 'done'].forEach(status => {
        const column = document.getElementById(`${status}-cards`);
        column.innerHTML = '';
        taskList.filter(task => task.status === status).forEach(task => {
            column.innerHTML += createTaskCard(task);
        });
    });

    $('.task-card').draggable({
        revert: 'invalid',
        stack: '.task-card',
        cursor: 'move',
        helper: 'clone'
    });

    $('.delete-task').click(handleDeleteTask);
}

// FUNCTION TO HANDLE ADDING

function handleAddTask(event) {
    event.preventDefault();

    const title = $('#taskTitle').val();
    const description = $('#taskDescription').val();
    const dueDate = $('#taskDueDate').val();

    if (title && description && dueDate) {
        const newTask = {
            id: generateTaskId(),
            title,
            description,
            dueDate,
            status: 'todo'
        };

        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();

        $('#formModal').modal('hide');
        $('#add-task-form')[0].reset();
    }
}

// FUNCTION THAT HANDLES DELETING TASK

function handleDeleteTask(event) {
    const taskId = $(event.target).closest('.task-card').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// FUNCTION THAT HANDLES DROPPING CARD INTO A NEW SECTION
function handleDrop(event, ui) {
    const taskId = ui.draggable.data('id');
    const newStatus = $(event.target).data('status');
    taskList = taskList.map(task => task.id === taskId ? { ...task, status: newStatus } : task);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}
 
// WHEN THE PAGE LOADS, RENDERS TASK LIST, ADD EVENT LISTENERS , MAKES LANES DROPPABLE, AND MAKES THE DUE DATE A FIELD PICKER

$(document).ready(function () {
    renderTaskList();

    $('#add-task-form').submit(handleAddTask);

    $('.lane').droppable({
        accept: '.task-card',
        drop: handleDrop,
        hoverClass: 'hovered'
    });

    $('#taskDueDate').datepicker({
        dateFormat: 'yy-mm-dd'
    });
});
