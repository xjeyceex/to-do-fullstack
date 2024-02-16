const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const cookieParser = require("cookie-parser");

//midware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//ROUTES

// Add todo
app.post("/todos", async (req, res) => {
    try {
        const { task_name, task_details } = req.body; // Destructure task_name and task_details directly from req.body

        const newTodo = await pool.query("INSERT INTO todoss (task_name, task_details) VALUES ($1, $2) RETURNING *", [task_name, task_details]);

        res.json(newTodo.rows[0]); // Return the first row of the inserted todo
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


// Get all todos
app.get("/todos", async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT * FROM todoss");
        res.json(allTodos.rows);
    } catch (err) {
        console.error(err.message);
    }
});
//get a todo
app.get("/todos/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const todo = await pool.query("Select * FROM todoss WHERE tasks = $1", [id])
        res.json(todo.rows[0])
    } catch (err) {
        console.error(err.message);
    }
});

app.put("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { task_name, task_details } = req.body;

        const updateToDo = await pool.query("UPDATE todoss SET task_name = $1, task_details = $2 WHERE id = $3", [task_name, task_details, id]);

        res.json("Todo was updated");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.delete("/todos/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deleteTodo= await pool.query("DELETE FROM todoss WHERE tasks = $1", [id]);
        res.json("Delete Success")
    } catch (err) {
        console.error(err.message);
    }
});


app.listen(5000, ()=>{
    console.log("server has started on port 5000")
});