const express = require("express")
const app = express()
const ejs = require("ejs")
const bodyParser = require("body-parser")

const mongoose = require("mongoose")
const url = "mongodb://localhost:27017/tasksdb"
mongoose.connect(url)

app.set('view engine', 'ejs')
app.use(express.static("static"))

app.use(bodyParser.urlencoded({extended : true}))

const dbschema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    }
})

const Task = new mongoose.model("Task", dbschema)


app.get("/", function(req, res){

    Task.find({},function(err, tasks){
        if(err)
            console.log(err)
        else{
            let today = new Date()
            res.render('list', {title : today.toDateString(), tasks: tasks})
        }
    })

})


app.post("/delete", function(req, res)
{
    let finishedid = req.body.tick

    Task.deleteOne({ _id : finishedid } , function(err)
    {
        if(err)
            console.log(err)
        else
            console.log("Deleted")
    })

    res.redirect("/")
})

app.post("/", function(req, res){

    let newTask = new Task({
        name : req.body.newtask
    })
    
    newTask.save()

    res.redirect("/")

})

app.listen(5000, function(){
    console.log("listening")
})