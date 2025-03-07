const mongoose=require('mongoose')

async function connectDatabase() {
    await mongoose.connect('mongodb+srv://mugammadhu2003:786Shifath@phising.e6y2l.mongodb.net/?retryWrites=true&w=majority&appName=phising')
    .then(()=>{
        console.log("database connected successfully")
    })
    .catch(()=>{
        console.log("database connection issue")
    })
}

module.exports=connectDatabase;