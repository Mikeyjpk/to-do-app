const PORT = process.env.PORT ?? 8000
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const app = express()
const pool = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(cors())
app.use(express.json())

// get all todos
app.get('/todos/:userEmail', async (request, response) => {
    const { userEmail } = request.params
    try {
        const todos = await pool.query('SELECT * FROM todos WHERE user_email = $1', [userEmail])
        response.json(todos.rows);
    } catch (exception) {
        console.error(`failed to get todo from database '${userEmail}', error='${exception.message}'`);
    }
})

// create a new todo
app.put('/todos', async (request, response) => {
    const { user_email, title, progress, date } = request.body
    console.log(user_email, title, progress, date)
    const id = uuidv4()
    try {
        const newToDo = await pool.query(`INSERT INTO todos(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5)`,
            [id, user_email, title, progress, date])
        response.json(newToDo)
    } catch (exception) {
        console.error(`failed to add new task, error=${exception}`)
    }
})

// edit a new todo 
app.patch(`/todos/:id`, async (request, response) => {
    const { id } = request.params
    const {user_email, title, progress, date} = request.body
    try {
        const editToDo = await pool.query('UPDATE todos SET title = $1, user_email = $2, date = $3, progress = $4 WHERE id = $5 ;', [title, user_email, date, progress, id]);
        response.json(editToDo)
    } catch (exception) {
        console.error(`failed to edit task, error=${exception}`)
    }
})

// delete a todo
app.delete('/todos/:id', async (request, response) => {
    const { id } = request.params
    
    try{
        const deleteToDo = await pool.query('DELETE FROM todos WHERE id = $1;', [id])
        response.json(deleteToDo)
    } catch (exception) {
        console.error(`failed to delete task, error =${exception}`)
    }  
})

//signup
app.post('/signup', async (request, response) => {
    const {email, password } = request.body
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    try{
        const signUp = await pool.query(`INSERT INTO users (email, hashed_password) VALUES($1, $2)`, 
            [email, hashedPassword])

            const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr'} )

            response.json({ email, token })

    } catch (exception) {
        console.error(`failed to sign up ${exception}`)
    }
})

//login
app.post('/login', async (request, response) => {
    const {email, password } = request.body
    try{
        const users = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        if(!users.rows.length) return response.json({ detail: 'User does not exist' })

        const success = await bcrypt.compare(password, users.rows[0].hashed_password)
        const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr'} )

        if (success) {
            response.json({ 'email' : users.rows[0].email, token})
        } else {
            response.json({ detail: "Login failed"})
        }
    } catch (exception) {
        console.error(`failed to sign up ${exception}`)
    }
})


app.listen(PORT, ( )=> console.log(`Server running on PORT ${PORT}`))