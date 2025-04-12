const express = require("express");
const axios = require("axios");
const userModel=require('../models/userModel')

const router = express.Router();

router.get('/',(req,res)=>{
    userModel.find().then((users)=>{
        res.json(users);
        }).catch((err)=>{
            res.status(500).json({message:err});
            })
})

router.delete('/:id',(req,res)=>{
    const {id}=req.params;
    userModel.findByIdAndDelete(id)
    .then((user)=>{
        res.json(user);
        })
        .catch((err)=>{
            res.status(500).json({message:err});
            })

})

module.exports= router;
