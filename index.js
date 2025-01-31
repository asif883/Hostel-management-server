const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

const port = process.env.PORT || 3000


// middleware 
app.use(cors({
  origin:[ 
    'http://localhost:5173',
    "https://royal-bachelor.vercel.app"
  ],
  optionsSuccessStatus: 200
}))
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
   const userCollection = client.db("Hostel-manager").collection("user")
   const dailyMealCollection = client.db("Hostel-manager").collection("Meal")
   const depositMoneyCollection = client.db("Hostel-manager").collection("Money")

  const dbConnect = async()=>{
    try{
        // await client.connect()
        // console.log('DB Connected');


       // daily cost
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

      // delete all cost 
      app.delete('/delete-all-cost' , async (req , res) =>{
        const deleteAll = await dailyCostCollection.deleteMany()
        res.send(deleteAll)
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

      // user
      app.post('/add-user' , async ( req , res ) =>{
        const userData = req.body
        const result = await userCollection.insertOne(userData)
        res.send(result)
      })

      app.get('/users', async (req , res) =>{
          const users = await userCollection.find().toArray()
          res.send(users)
      })
      app.delete('/delete-user/:id', async(req , res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result =await userCollection.deleteOne(query);
        res.send(result);
      })

      // daily meal
      app.post('/add-meal', async ( req , res )=>{
        const mealData = req.body
        const result = await dailyMealCollection.insertOne(mealData)
        res.send(result)
      })

      app.get("/daily-meal", async (req, res) => {
        try {
            const meals = await dailyMealCollection.find().toArray();
    
            // If meals are not found, return an empty array
            if (!Array.isArray(meals)) {
                return res.send({ meals: [], totalMealsPerMember: Array(7).fill(0) });
            }
    
            // Ensure each day has a meals array
            meals.forEach((day) => {
                if (!Array.isArray(day.meals)) {
                    day.meals = Array(7).fill(0);
                }
                day.totalMeals = day.meals.reduce((sum, meal) => sum + (meal || 0), 0).toFixed(1);
            });
    
            // Calculate total meals per member
            const totalMealsPerMember = Array(7).fill(0);
            meals.forEach((day) => {
                day.meals.forEach((meal, index) => {
                    totalMealsPerMember[index] += meal || 0;
                });
            });
    
            res.send({
                meals,
                totalMealsPerMember: totalMealsPerMember.map((m) => Number(m.toFixed(1))),
            });
        } catch (error) {
            console.error("Error fetching meals:", error);
            res.status(500).send({ success: false, message: "Failed to fetch meals" });
        }
      });
    
      app.delete('/delete-all-meals', async (req, res) => {
        try {
            const result = await dailyMealCollection.deleteMany({});
            res.send({ success: true, message: "All meals deleted successfully", deletedCount: result.deletedCount });
        } catch (error) {
            console.error("Error deleting meals:", error);
            res.status(500).send({ success: false, message: "Failed to delete meals" });
        }
      });

      // deposit money routes 
      app.post('/add-money' , async(req, res )=>{
         const depositMoney = req.body 
         const result = await depositMoneyCollection.insertOne(depositMoney)
         res.send(result)
      })

      app.get('/deposit-money', async(req , res) =>{
          const result = await depositMoneyCollection.find().toArray()
          res.send(result)
      })

      app.delete('/money/:id', async(req , res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result =await depositMoneyCollection.deleteOne(query);
        res.send(result);
      })

      app.patch('/update/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateMoney = req.body;
            
            const update = {
                $set: {
                    name: updateMoney.name,
                    date: updateMoney.date,
                    amount: updateMoney.amount
                }
            };
    
            const result = await depositMoneyCollection.updateOne(filter, update, options);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Server error', error });
        }
    });
    


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