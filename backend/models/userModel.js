const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
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
    password:{
        type:String,
        require:true,
        description:"Password must be string and required"
    }
},{collection:"users"})

const userModel=mongoose.model("User",userSchema)
module.exports=userModel