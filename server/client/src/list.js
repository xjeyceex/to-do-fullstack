import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faCheck, faTimes, faL } from '@fortawesome/free-solid-svg-icons';
import './App.css';

const ListTodos = () => {
  const [todos, setTodos] = useState([]);
  const [description, setDescription] = useState("");
  const [taskname, setTaskName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editTodoId, setEditTodoId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);

  const getTodos = async () => {
    setLoading(true);
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch("/get/todo", {
        signal: controller.signal
      });
      if (response.ok) {
        const jsonData = await response.json();
        setTodos(jsonData);
      } else {
        throw new Error('Failed to fetch todos');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (description.trim() !== "" && taskname.trim() !== "") {
      try {
        setLoading(true);
        const body = { taskname, description };
        const response = await fetch("/add/todo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (response.ok) {
          setDescription("");
          setTaskName("");
          setShowForm(true);
          getTodos();
          alert('Task successfully added');
        } else {
          throw new Error('Failed to add task');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    } else {
      alert('Task name and description are required.');
    }
  };

  const handleUpdateTask = async () => {
    if (description.trim() === "" || taskname.trim() === "" || editTodoId === null) {
      alert('Task name and description are required.');
    } else {
      try {
        setLoading(true);
        const body = { taskname, description };
        const response = await fetch(`/update/${editTodoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (response.ok) {
          setDescription("");
          setTaskName("");
          setEditMode(false);
          setEditTodoId(null);
          setShowForm(true);
          getTodos();
        } else {
          throw new Error('Failed to update task');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  const handleEditTodo = (id, taskname, description) => {
    setDescription(description);
    setTaskName(taskname);
    setShowForm(true);
    setEditMode(true);
    setEditTodoId(id);
    setEditingTodoId(id);
  };

  const handleDeleteTodo = async (id) => {
    const confirmation = window.confirm('Are you sure you want to delete the task?');
    if (!confirmation) return;

    try {
      setLoading(true);
      const response = await fetch(`/delete/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        getTodos();
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleTodoStatus = async (id, done) => {
    try {
      setLoading(true);
      const response = await fetch(`/markdone/${id}?done=${done}`);
      if (response.ok) {
        await response.json();
        getTodos();
      } else {
        throw new Error('Failed to update todo status');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getTodos();

    // Cleanup function to abort fetch when component unmounts or before fetching again
    return () => {
      if (abortController) {
        abortController.abort();
        setAbortController(null);
      }
    };
  }, []);

  const handleCancel = () =>{
    setEditMode(false);
    setShowForm(false);
    setDescription("");
    setTaskName("");
  }

  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  return (
    <div className="container">
      {loading && <p>Loading...</p>}

      {/* Saved Task Section */}
      <h1>Saved Tasks</h1>
      <div className="savedtask-container">
        {todos.map((todo, index) => (
          <div
            key={todo.todo_id}
            className="saved-container" id={todo.markdone === false ? "" : "cardbox"}
          >
            <h3>Task #{todos.length - index}</h3>
            <h4>Task Name:</h4>
            <p>{todo.taskname}</p>
            <h4>Task Details:</h4>
            <p>{todo.description}</p>
            <h5>Created At:</h5>
            <p>{new Date(todo.created_at).toLocaleString()}</p>

            <button onClick={() => handleDeleteTodo(todo.todo_id)} className="delete">
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
            {todo.markdone === false ? (
              <button onClick={() => handleEditTodo(todo.todo_id, todo.taskname, todo.description)} className="edit">
              <FontAwesomeIcon icon={faEdit} style={{ color: 'white'}} />
            </button>
            ) : ""}
            {todo.markdone === false ? (
              <button className='done' onClick={() => handleTodoStatus(todo.todo_id, true)}><FontAwesomeIcon icon={faCheck} /></button>
            ) : (
              <button className='unfinished' onClick={() => handleTodoStatus(todo.todo_id, false)}><FontAwesomeIcon icon={faTimes}/></button>
            )}
          </div>
        ))}
      </div>

      {/* New Task Section */}
      {!showForm && (<button className="newtask-btn" onClick={() => setShowForm(true)}>New Task</button>)}
      {showForm && (
        <div className="newtask">
          {editMode ? (
            <h1 className='newtask-editing'>{`Editing Task #${todos.length - todos.findIndex(todo => todo.todo_id === editingTodoId)}`}</h1>
          ) : ""}
          <label>Task Name:</label>
          <input
            type="text"
            value={taskname}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter your Task Name"
            className="transparent-input"
          />
          <label>Task Details:</label>
          <textarea
            className="textarea transparent-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter the details here"
          />
          <div className='btn-container'>
            {editMode ? (
              <button onClick={handleUpdateTask}>Update</button>
            ) : (
              <button onClick={handleAddTask}>Save</button>
            )}
            <button onClick={() => {
              if (description.trim() !== "" || taskname.trim() !== "") {
                const confirmation = window.confirm('Are you sure you want to cancel?');
                if (!confirmation) return;
                setEditMode(false);
                setShowForm(false);
                setDescription("");
                setTaskName("");
              } else {
                setEditMode(false);
                setShowForm(false);
                setDescription("");
                setTaskName("");
              }
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListTodos;
