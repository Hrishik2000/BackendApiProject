const express = require("express");
const users = require("./MOCK_DATA.json");
const fs = require("fs");
const log = require('./log.txt');

const app = express();
const PORT = 8000;
//middlewhare help to detect what kind of data is being recieved & how to handel it
//middlewhere -> just like plugin to use & understand  recieved data
app.use(express.urlencoded({extended: false}));

//!functions of middleware 
//Making quick changes to the request and response objects
//Calling the next middleware immediately as per the stack
//Effectively executing any code
//Automatically terminating the request-response cycle


//custom middleware
app.use((req, res, next) => {
  //return res.json({type: "custom Middleware"}); // we can return from the middleware 
//   console.log(req.requestTime);


        // fs.appendFile('log.txt', `\n ${Date.now()} : ${req.method} : ${req.path}`, (err)=>{
        //    next();
        // });
     
    next();
    //calls next middleware /forward the request 
  

})

app.get("/users", (req, res) => {
    const html = `
          <ul>
              ${users.map((user) => `<li>${user.first_name}</li>`).join('')}
          </ul>
      `;
  
    res.send(html);
  });


  
app.get("/api/users", (req, res) => { 
    //we can set custom headers
    
    //we can send custom headers like this
                //HeaderKey , Value
    res.setHeader('X-name', "hrishik") 

  return res.json(users);
});

// app.get("/api/users/:id", (req, res) => { 
//     const id = req.params.id;
//     //console.log(typeof(id));
//     const user  = users.find(user => user.id == id);
//      return res.json(user);
//   });


// app.patch("/api/users/:id", (req, res) => {
//     //TODO: update user with given id
//     return res.json({status: 'pending'});
// })
// app.delete("/api/users/:id", (req, res) => {
//     //TODO: Delete the user with id
//     return res.json({status: 'pending'});
// })

app.post("/api/users", (req, res) => {
    //TODO: Create new user
    //users.body->
    const body = req.body;

    if(!body || body.first_name || body.last_name || body.email ||  body.gender || body.job_title){
            res.status(400).json({ status: "all fields are required"});
    }
    
    const NewUserbody = {...body , id: users.length+1}; //req.body holds the recieved data from the from the frontend
    console.log('Body',NewUserbody)
    console.log(users.length);
    
    users.push(NewUserbody);
     
    fs.writeFile('./MOCK_DATA.json',JSON.stringify(users), (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error writing to file" });
        }
        return res.status(201).json({ status: 'done & new user ID is', details: NewUserbody });
    });
})

app.put('/api/users',(req, res) => {
    //TODO: Add user to file 
    const userDetails = req.body;
    const newUser = {...userDetails , id: users.length +1};
    users.push(newUser);

    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err)=>{
            if(err){
                res.status(500).json({status: 'error in writing file'});

            }
            res.status(200).json({status: 'User added successfully' ,details: newUser});
    })
});

//if route is common for multiple  http methods then we can merge them also
//grouping of routes
app.route('/api/users/:id')
.get((req, res) => { 
    const id = req.params.id;
    //console.log(typeof(id));
    const user  = users.find(user => user.id == id);

    if(user)
     return res.json(user);
    else
        return res.status(404).json({status: "user not found"});
  })
.patch( (req, res) => {
    //TODO: update user with given id
    const id = req.params.id;
    const userIndex = users.findIndex(user => user.id == id);

    if(userIndex ===  -1){
        return res.status(404).json({status: 'id Not Found'});
    }
    const updatedUser = {...users[userIndex], ...req.body};
    users[userIndex] = updatedUser;

    fs.writeFile('./MOCK_DATA.json',JSON.stringify(users),(err)=>{
        if(err){
            return res.status(500).json({status:'error in writing file'});
        }
        return res.json({ status: "done", updatedUser });
    })
    
})
.delete((req, res) => {
    //TODO: Delete the user with id
    const id = req.params.id;
     const userIndexToDelete  = users.findIndex(user => user.id == id);
      if(userIndexToDelete=== -1){
        return res.status(404).json({status: 'user not found'});
      }
      users.splice(userIndexToDelete,1);

      fs.writeFile('./MOCK_DATA.json', JSON.stringify(users),(err)=>{
            if(err){
                return res.status(500).json({status: 'error in writing file'});
            }
            return res.status(200).json({status: 'user deleted successfully'});
      });
     
   
})



app.listen( PORT , ()=> console.log(`server started on port no ${PORT}`))
