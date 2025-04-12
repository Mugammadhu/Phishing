const express = require("express");
const contactModel=require('../models/contactModel')

const router = express.Router();

router.get('/',(req,res)=>{
    contactModel.find().then((contacts)=>{
        res.json(contacts);
        }).catch((err)=>{
            res.status(500).json({message:err});
            })
})

router.delete('/:id',(req,res)=>{
    const {id}=req.params;
    contactModel.findByIdAndDelete(id)
    .then((contact)=>{
        res.json(contact);
        })
        .catch((err)=>{
            res.status(500).json({message:err});
            })

})

module.exports= router;
