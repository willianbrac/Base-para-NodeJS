const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {

    const { username } = req.headers;
    const user = users.find( user => user.username === username );
    
    if(!user) {
        return res.status(404).json({ error : "User not found" });
    }

    req.user = user;

    return next();
}




app.post('/users', (req, res) => {
  const { name, username } = req.body;

    const userAlreadyExists = users.some((user) => user.username === username);
    
    if (userAlreadyExists) {
        return res.status(400).json({ MessageErr : "User already exists!" });
    }

    users.push(
        {  
            id : uuidv4(),
            name,
            username,
            todos: []
        }
    );
        
    return res.status(201).json(users[users.length -1]);
});


app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  return res.json(user.todos);
});


app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const task = {
    id:  uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at : new Date()
  }

  user.todos.push(task);

  return res.status(201).json(task);

});




app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const position = parseInt(req.params.id);
  const { user } = req; 
  const assignment = user.todos[position];
  const { title, deadline } = req.body;

  if(!assignment){
    return res.status(404).json({ error : "assignment not found!" });
  }else{
    assignment.title = title;
    assignment.deadline = deadline;
    return res.status(201).json(assignment);
  }  
});



app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const position = parseInt(req.params.id);
  const { user } = req; 
  const assignment = user.todos[position];

  if(!assignment){
    return res.status(404).json({ error : "assignment not found!" });
  }else{
    assignment.done = true;
    return res.status(204).send();
  }  
});


app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const position = parseInt(req.params.id);
  user.todos.splice(position, 1);

  return res.status(200).json(user.todos);
});

module.exports = app;