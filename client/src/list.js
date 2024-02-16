/*eslint semi: "warn"*/

import React, { useState,useEffect } from 'react';
import './App.css';

const ListTodos = () => {
    const [todos, setTodos] = useState([]);
    const [description, setDescription] = useState("");
    const [taskname, setTaskName] = useState("");
    const [editMode, setEditMode] = useState(false); // State to track edit mode
    const [editTodoId, setEditTodoId] = useState(null); // State to track which todo is being edited
    const [showForm, setShowForm] = useState(false);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (description.trim() !== "" && taskname.trim() !== "") {
            try {
                const body = { taskname, description };
                const response = await fetch("http://localhost:5000/todos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
                if (response.ok) {
                    setDescription(""); // Clear input after adding task
                    setTaskName(""); // Clear task name input
                    setShowForm(false);
                    getTodos();
                } else {
                    throw new Error('Failed to add task');
                }
            } catch (err) {
                console.error(err.message);
            }
        } else {
            console.error('Task name and description are required.');
        }
    };
    const handleUpdateTask = async () => {
        if (description.trim() === "" || editTodoId === null) return;
            if (description.trim() !== "" && taskname.trim() !== "") {
            try {
                const body = { taskname, description };
                await fetch(`http://localhost:5000/todos/${editTodoId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
                // Clear input after updating task

                setDescription("");
                setTaskName("");
                setEditMode(false);
                setEditTodoId(null);
                setShowForm(false);
                // Refresh todos after updating
                getTodos();
            } catch (err) {
                console.error(err.message);
            }
    }
    };

    const handleEditTodo = (id, taskname, description) => {
        setDescription(description); // Populate input field with current description
        setTaskName(taskname);
        setShowForm(true);
        setEditMode(true); // Switch to edit mode
        setEditTodoId(id); // Set the id of the todo being edited
    };

    const handleDeleteTodo = async id => {
        try {
            await fetch(`http://localhost:5000/todos/${id}`, {
                method: "DELETE"
            });

            // Refresh todos after deleting
            getTodos();
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleDone = async (id) =>{
        const response = await fetch (`http://localhost:5000/todos/${id}`);
        await response.json();
        getTodos();
    };

    const handleUnfinished = async (id) =>{
        const response = await fetch (`http://localhost:5000/todos/unfinished/${id}`);
        await response.json();
        getTodos();
    };


    const getTodos = async () => {
        try {
            const response = await fetch("http://localhost:5000/todos");
            const jsonData = await response.json();
            setTodos(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => {
        getTodos();
    }, []);

       return (
        <div className="container">
          {/* Saved Task Section */}
          <div className="savedtask-container">
            <h1>Saved Tasks</h1>
            {todos.map((todo, index) => (
              <div
                key={index}
                className="saved-container" id={todo.markdone === "unfinished" ? "" : "cardbox"}>
                <h3>Task Name:</h3>
                <p>{todo.taskname}</p>
                <h3>Task Details:</h3>
                <p>{todo.description}</p>
                <button onClick={() => handleDeleteTodo(todo.todo_id)} className="delete">Delete</button>
                <button className="edit" onClick={() => handleEditTodo(todo.todo_id, todo.taskname, todo.description)}>Edit</button>
                {
                todo.markdone === "unfinished" ? (
                <button className='edit' onClick={() => handleDone(todo.todo_id)}>Done</button>
                ) : (
                <button className='edit' onClick={() => handleUnfinished(todo.todo_id)}>Unfinished</button>
                    )
                }
              </div>
            ))}
          </div>
      
          {/* New Task Section */}
          <div className="newtask-container">
            <button className="newtask-btn" onClick={() => setShowForm(true)}>
              New Task
            </button>
            {showForm && (
              <div className="newtask">
                <label>Task Name:</label>
                <input
                  type="text"
                  value={taskname}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Enter your Task Name"
                  class="transparent-input"
                />
                <label>Task Details:</label>
                <textarea className="textarea transparent-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter the details here"
                  
                />
                {editMode ? (
                  <button onClick={handleUpdateTask}>Update</button>
                ) : (
                  <button onClick={handleAddTask}>Save</button>
                )}
               <button onClick={() => {
                    setEditMode(false);
                    setShowForm(false);
                    setDescription("");
                    setTaskName("");
                }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      );
     };

export default ListTodos;