const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000


// middleware 
app.use(cors())
app.use(express.json())


app.get('/' , async (req , res)=>{
    res.send('server is running')
})

app.listen(port, ()=>{
    console.log(`server is running on the port: ${port}`);
})