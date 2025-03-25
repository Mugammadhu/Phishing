const mongoose=require('mongoose')

const contactSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true,
        description:"Name must be string and required"
    },
    email:{
        type:String,
        require:true,
        description:"Email must be string and required"
    },
    message:{
        type:String,
        require:true,
        description:"Message must be string and required"
    }
},{collection:"contacts"})

const contactModel=mongoose.model("Contact",contactSchema)
module.exports=contactModel;