const express=require("express");
const app =express();
const Datastore=require("nedb");

const port=process.env.PORT || 4040;
app.listen(port,()=>console.log(`Server started at port ${port}...`));
app.use(express.static("client"));
app.use(express.json());

const db=new Datastore("./data.db");

db.loadDatabase();
//

db.find({},(err,docs)=>{
    docs.forEach(entry=>{
        var dbName= entry.username;
        eval(`var ${dbName} = new Datastore("./databases/${dbName}.db")`);
        eval(`${dbName}.loadDatabase()`);
    })
})

function insertEntry(dbName,entry){
    console.log("insert function");
    eval(`var ${dbName} = new Datastore("./databases/${dbName}.db")`);
    eval(`${dbName}.loadDatabase()`);
    eval(`${dbName}.insert(${entry})`);

}

//
app.post("/signup",(req,res)=>{
   
    var data= req.body;
    db.find({username:data.username},(err,docs)=>{
        
        if(docs.length!=0)
            res.json({mssg:"Username already exist!!"});
        else{
            var dbName= data.username;
            eval(`var ${dbName} = new Datastore("./databases/${dbName}.db")`);
            eval(`${dbName}.loadDatabase()`);
            
            data.friends=[{name:data.name,username:data.username}];         
            db.insert(data);
            res.json(data);
            
        }

    })
   
    
})
app.post("/login",(req,res)=>{
   
    var data= req.body;
    db.find({username:data.username},(err,docs)=>{
        if(docs.length!=0){
            if(docs[0].password==data.password){
                res.json({mssg:"Success",username:data.username});
                console.log(`Logged in as ${data.username}`);
            }
            else
                res.json({mssg:"Invalid password!!"});
        }
        else
            res.json({mssg:"No username exist!!"})
    })
})
app.post('/loadData',(req,res)=>{
    db.find({username:req.body.username},(err,docs)=>{
        res.json(docs[0].friends);   //returns array
        
    })
   
})
app.post("/search",(req,res)=>{

    const exp=new RegExp(`^${req.body.username}`);
    db.find({username:{ $regex: exp}},(err,docs)=>{
        var array=[];
        docs.forEach(element => {
            array.push(element.username);
        });
        res.json({suggestions:array});
    })
})

app.post("/addFriend",(req,res)=>{
    var friend={};
    friend.username=req.body.friend;
    db.find({username:friend.username},(err,docs)=>{
        friend.name=docs[0].name;
    })    
        //updating this friend to db 
        db.update({username: req.body.username }, { $push: { friends: friend } }, {}, function () {});
        //
        var ourInfo={username:req.body.username};
        db.find(ourInfo,(err,docs)=>{
            ourInfo.name=docs[0].name;
        })
        db.update({username: friend.username }, { $push: { friends: ourInfo } }, {}, function () {});

        insertEntry(req.body.username,`{username:"${friend.username}",messages:[]}`);
        insertEntry(friend.username,`{username:"${req.body.username}",messages:[]}`);
        //
            console.log("New friend added");
            res.json(friend);
        //   });

    
    
    
})

app.post("/sendMessage",(req,res)=>{
    console.log(req.body);
    //loading senders database
    var dBase=req.body.from;
    eval(`var ${dBase} = new Datastore("./databases/${dBase}.db")`);
    eval(`${dBase}.loadDatabase()`);

    var message=JSON.stringify({isSenderMe:true,mssg:req.body.mssg});
    eval(`${dBase}.update({username: "${req.body.to}" }, { $push: { messages: ${message}} }, {}, function () {})`);

    //loading receipient database
    var dBase1=req.body.to;
    eval(`var ${dBase1} = new Datastore("./databases/${dBase1}.db")`);
    eval(`${dBase1}.loadDatabase()`);

    var message1=JSON.stringify({isSenderMe:false,mssg:req.body.mssg});
    eval(`${dBase1}.update({username: "${req.body.from}" }, { $push: { messages: ${message1}} }, {}, function () {})`);
    res.json({status:"Successfully sent!!"});
})

app.post("/loadMessages",(req,res)=>{
   
    var sender=req.body.senderUsername;
    var receipient=req.body.friendUsername;
     //loading senders database

    
    eval(`var ${sender} = new Datastore("./databases/${sender}.db")`);
    eval(`${sender}.loadDatabase()`);

    
    eval(`${sender}.find({username:"${receipient}"},(err,docs)=>{
       res.json({messages:docs[0].messages});

    })`);
})