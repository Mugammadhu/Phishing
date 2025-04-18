const express = require("express");
const URL=require('../models/URL.js');

const router = express.Router();

router.get('/',(req,res)=>{
    URL.find().then((urls)=>{
        res.json(urls);
        }).catch((err)=>{
            res.status(500).json({message:err});
            })
})

router.delete('/:id',(req,res)=>{
    const {id}=req.params;
    URL.findByIdAndDelete(id)
    .then((url)=>{
        res.json(url);
        })
        .catch((err)=>{
            res.status(500).json({message:err});
            })

})

module.exports= router;
