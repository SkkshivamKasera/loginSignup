const express = require('express')
const { body, validationResult } = require('express-validator')
const bcryptjs = require('bcryptjs')
const mongoose = require('mongoose')
const Users = require('./Users')

const url = "mongodb+srv://database:Shivam@cluster0.9ardu0g.mongodb.net/?retryWrites=true&w=majority"
try{
    mongoose.connect(url)
    console.log('database connected')
}catch{
    console.log('database connection failed!!!')
}

const app = express()

app.use(express.json())

let port = 5000
let success = true

app.post('/signup', [
    body('name').isLength({min: 3}),
    body('email').isEmail(),
    body('password').isLength({min: 3})
], async (req, res) => { 
    const errors = validationResult(req)
    if(!errors.isEmpty()){ return res.send({success: (!success), errors: "Invalid Inputs"}) }
    try{
        let user = await Users.findOne({email: req.body.email})
        if(user){ return res.send({success: (!success), errors: "Email is already exists"}) }
        const salt = await bcryptjs.genSalt(10)
        const secure_password = await bcryptjs.hash(req.body.password, salt)
        Users.create({
            name: req.body.name,
            email: req.body.email,
            password: secure_password
        })
        res.send({success: success, Welcome: `Welcome ${req.body.name}`})
    }
    catch(error){
        return res.send( {success: (!success), errors: (error.message)} )
    }
})

app.post('/login', [
    body('email').isEmail(),
    body('password').isLength({min: 3})
], async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){ return res.send({success: (!success), errors: "Invalid Inputs"}) }
    try{
        const {email, password} = req.body
        let user = await Users.findOne({email})
        if(!user){ return res.send({success: (!success), errors: "Invalid Inputs"}) }
        const password_comparision = await bcryptjs.compare(password, user.password)
        if(!password_comparision){ return res.send({success: (!success), errors: "Invalid Inputs"}) }
        res.send({success: success, Welcome: `Welcome ${user.name}`})
    }catch(error){
        return res.send( {success: (!success), errors: (error.message)} )
    }
})

app.listen(port, () => {
    console.log("app listening on --> http://localhost:5000")
})