const express = require("express");
const route = express();
const cors = require("cors");
const pool = require("./db");

route.use(cors());
route.use(express.json());

// Error Handling Middleware
route.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Add todo
route.post("/add/todo", async (req, res) => {
    try {
        const { taskname, description } = req.body;
        if (!taskname || !description) {
            return res.status(400).json({ error: "Task name and description are required." });
        }
        const markdone = false;
        const newTodo = await pool.query('INSERT INTO todo (taskname, description, markdone) VALUES ($1, $2, $3) RETURNING *', [taskname, description, markdone]);
        res.json(newTodo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all todos
route.get("/get/todo", async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT todo_id, taskname, description, markdone, created_at FROM todo ORDER BY todo_id DESC");
        res.json(allTodos.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Mark todo as done or unfinished
route.get("/markdone/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { done } = req.query;
        if (done !== 'true' && done !== 'false') {
            return res.status(400).json({ error: 'Invalid done parameter. Use true or false.' });
        }
        const markdone = await pool.query("UPDATE todo SET markdone = $1 WHERE todo_id = $2 RETURNING *", [done === 'true', id]);
        res.json({ status: 'Success', message: done === 'true' ? "To Do is Done" : "To Do is not yet Finished", todo: markdone.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a todo
route.put("/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { taskname, description } = req.body;
        if (!taskname || !description) {
            return res.status(400).json({ error: "Task name and description are required." });
        }
        const updateTodo = await pool.query("UPDATE todo SET taskname = $1, description = $2 WHERE todo_id = $3 RETURNING *", [taskname, description, id]);
        if (updateTodo.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json({ message: "To do was updated", todo: updateTodo.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a todo
route.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1 RETURNING *", [id]);
        if (deleteTodo.rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json({ message: "Delete Success", todo: deleteTodo.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

route.listen(5000, () => {
    console.log("server has started on port 5000")
});
