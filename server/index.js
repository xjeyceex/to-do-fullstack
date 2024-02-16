const express = require("express");
const route = express();
const cors = require("cors");
const pool = require("./db");
const cookieParser = require("cookie-parser");

//midware
route.use(cors());
route.use(express.json());
route.use(cookieParser());

//ROUTES

// Add todo
route.post("/todos", async (req, res) => {
    try {
        const markdone = "unfinished"
        const { taskname, description } = req.body;
        const newTodo = await pool.query('INSERT INTO todo (taskname, description, markdone) VALUES ($1, $2, $3)', [taskname, description, markdone]);
        res.json(newTodo.rows);
    } catch (err) {
        console.error(err.message);
    }
});

// Get all todos
route.get("/todos", async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT todo_id, taskname, description, markdone FROM todo ORDER BY todo_id DESC");
        res.json(allTodos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//mark done
route.get("/todos/:id", async (req, res) =>{
    try {
        const done = "done";
        const {id} = req.params;
        const markdone = await pool.query(`UPDATE todo SET markdone = '${done}' WHERE todo_id = '${id}'`);
       if(markdone.rowCount == 1){
        return res.json({status:'Success', message:"To Do is Done"})
       }
    } catch (err) {
        console.error(err.message);
    }
});
//Mark Done
route.get("/todos/unfinished/:id", async (req, res) =>{
    try {
        const unfinished = "unfinished";
        const {id} = req.params;
        const markdone = await pool.query(`UPDATE todo SET markdone = '${unfinished}' WHERE todo_id = '${id}'`);
       if(markdone.rowCount == 1){
        return res.json({status:'Success', message:"To Do is not yet Finished"})
       }
    } catch (err) {
        console.error(err.message);
    }
});
//update a todo
route.post("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { taskname, description } = req.body;

        const updateToDo = await pool.query("UPDATE todo SET taskname = $1, description = $2 WHERE todo_id = $3", [taskname, description, id]);
        res.json({ message: "To do was updated" }); // Sending a proper JSON response
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Internal Server Error" }); // Handling errors with a proper status code and error message
    }
});

route.delete("/todos/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const deleteTodo= await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
        res.json("Delete Success")
    } catch (err) {
        console.error(err.message);
    }
});


route.listen(5000, ()=>{
    console.log("server has started on port 5000")
});