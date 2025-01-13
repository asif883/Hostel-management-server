const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const port = process.env.PORT || 3000


// middleware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.osztyuf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
   const dailyCostCollection = client.db("Hostel-manager").collection("dailyCost")
   const utilityCostCollection = client.db("Hostel-manager").collection("utilityCost")

  const dbConnect = async()=>{
    try{
        await client.connect()
        console.log('DB Connected');


       // Routes
       app.post('/add-daily-cost', async(req , res)=>{
            const cost = req.body
            const result = await dailyCostCollection.insertOne(cost)
            res.send(result)
       }) 
       
       app.get('/daily-cost' , async( req, res )=>{
           const dailyCost = await dailyCostCollection.find().toArray()

           const totalCost = dailyCost.reduce((total, item) => {
                const cost = parseFloat(item.cost) || 0;
                return total + cost;
            }, 0)
           res.send({dailyCost, totalCost})
       })

       app.delete('/daily-cost/:id', async(req , res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result =await dailyCostCollection.deleteOne(query);
        res.send(result);
      })
      
      //  Utility 
      app.post('/add-utility-cost', async(req , res)=>{
            const cost = req.body
            const result = await utilityCostCollection.insertOne(cost)
            res.send(result)
       })    
      app.get('/utility-cost' , async( req, res )=>{
           const utilityCost = await utilityCostCollection.find().toArray()

           const totalCost = utilityCost.reduce((total, item) => {
                const cost = parseFloat(item.cost) || 0;
                return total + cost;
            }, 0)
           res.send({utilityCost, totalCost})
       })  
       app.delete('/utility-cost/:id', async(req , res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result =await utilityCostCollection.deleteOne(query);
        res.send(result);
      })

    }
    catch(err){
      console.log(err.massage);
    }
  }
 dbConnect()

app.get('/' , async (req , res)=>{
    res.send('server is running')
})

app.listen(port, ()=>{
    console.log(`server is running on the port: ${port}`);
})