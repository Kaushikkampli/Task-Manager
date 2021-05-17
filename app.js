const express = require("express")
const app = express()
const ejs = require("ejs")
const bodyParser = require("body-parser")
const _ = require("lodash")

const mongoose = require("mongoose")
const url = "mongodb+srv://admin:mongo123@taskcluster.yics9.mongodb.net/tasksdb"
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

const listdb = new mongoose.Schema({
    name : String,
    elements : [dbschema]
})

const List = new mongoose.model("List", listdb)

let sample = new Task({
    name : "sample"
})

sample.save()

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

app.get("/:listName", function(req, res){

    let listName = _.capitalize(req.params.listName)

    List.findOne({name : listName}, function(err, list)
    {
        if(!err)
        {
            if(!list){
                
                console.log("creating")
                let newlist = new List({
                    name : listName,
                    elements : [sample]
                })

                newlist.save()

                res.redirect("/" + listName)

            }
            else{
                res.render('list', {title : list.name, tasks : list.elements})
            }
        }
        else
            console.log(err)
    })
})

app.post("/delete", function(req, res)
{

    let today = new Date()
    let finishedid = req.body.tick

    if(req.body.listName === today.toDateString()){
        
        Task.deleteOne({ _id : finishedid } , function(err)
        {
            if(err)
                console.log(err)
            else
                console.log("Deleted")
        })

        res.redirect("/")
    }
    else{

        List.findOne({name : req.body.listName}, function(err, list){
            
            List.findOneAndUpdate({name : req.body.listName},{$pull : {elements : {_id : finishedid}}}, function(err, list){
                res.redirect("/" + req.body.listName)
            })
        })
    }

})

app.post("/", function(req, res){

    let today = new Date()
    
    let newTask = new Task({
        name : req.body.newtask
    })

    if(req.body.listName === today.toDateString()){
        
        newTask.save()
        res.redirect("/")
    }
    else{

        List.findOneAndUpdate({name : req.body.listName},{$push : {elements : newTask}}, function(err, list){
            res.redirect("/" + req.body.listName)
        })
    }

})

app.listen(process.env.PORT || 3000, function(){
    console.log("listening")
})