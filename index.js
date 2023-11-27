const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT || 5000


// middleware
app.use(cors())
app.use(express.json())

// import database connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hrhwfvt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db('Bery_DB').collection('users')
    const propertyCollection = client.db('Bery_DB').collection('property')
    const reviewsCollection = client.db('Bery_DB').collection('review')
    const wishlistCollection = client.db('Bery_DB').collection('wishlist')
    const propertyBoughtCollection = client.db('Bery_DB').collection('property_bought')

    // JWT related API
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ token })
    })

    // middlewares
    const verifyToken = (req, res, next) => {
      console.log('inside verify token',req.headers.authorization)
      if(!req.headers.authorization){
        return res.status(401).send({ message: 'forbidden access'})
      }
      const token =  req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
          return res.status(401).send({message: 'forbidden  access'})
        }
        req.decoded = decoded;
        next()
      })
    }



    // Users related API
    app.get('/allUsers', verifyToken, async (req, res) => {

      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    app.get('/users', async (req, res) => {
      const userEmail = req.query.email
      const query = { email: userEmail }
      const result = await usersCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const userInfo = req.body
      // inserrt email if user doesn't exist:
      // you can do this many ways (1. unique email, 2. Upsert 3.simple checking)
      const query = { email: userInfo.email }
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedID: null })
      }
      const result = await usersCollection.insertOne(userInfo)
      res.send(result)
    })
    // user admin role Control API
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
    // user Agent role Control API
    app.patch('/users/agent/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          role: 'agent'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc)
      res.send(result)
    })
    // user Delete button control API
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await usersCollection.deleteOne(query)
      res.send(result)
    })


    // All properties data API calls
    app.get('/property', async (req, res) => {
      const result = await propertyCollection.find().toArray()
      res.send(result)
    })
    // Get one property by id
    app.get('/property/:id', async (req, res) => {
      const propertyID = req.params.id
      const query = { _id: new ObjectId(propertyID) }
      const result = await propertyCollection.findOne(query)
      res.send(result)
    })


    // All reviews data API calls
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray()
      res.send(result)
    })


    // ----------------------- Wishlist API --------------------
    // get properties of wishlist firn wishlist API
    app.get('/allWishlist', async (req, res) => {
      const result = await wishlistCollection.find().toArray();
      res.send(result)
    })
    app.get('/wishlist', async (req, res) => {
      const email = req.query.email;
      const query = { wishUserEmail: email };
      const result = await wishlistCollection.find(query).toArray();
      res.send(result);
    });

    // add properties to wishlist
    app.post('/wishlist', async (req, res) => {
      const wishItem = req.body
      const result = await wishlistCollection.insertOne(wishItem)
      res.send(result)
    })
    //delete property from wishlist
    app.delete('/wishlist/:id', async (req, res) => {
      const wishID = req.params.id
      const query = { _id: new ObjectId(wishID) }
      const result = await wishlistCollection.deleteOne(query)
      res.send(result)
    })

    // ---------------------------------- Property Bought API starts --------------------------------
    // get offered properties in property bought list API
    app.get('/allProperty_bought', async (req, res) => {
      const result = await propertyBoughtCollection.find().toArray()
      res.send(result)
    })

    // get offered properties in property bought list by USER email
    app.get('/property_bought', async (req, res) => {
      const email = req.query.email
      const query = { BuyerEmail: email }
      const result = await propertyBoughtCollection.find(query).toArray();
      res.send(result)
    })

    // add offered properties to property bought list
    app.post('/property_bought', async (req, res) => {
      const offeredProperty = req.body
      const result = await propertyBoughtCollection.insertOne(offeredProperty)
      res.send(result)
    })
    // ---------------------------------- Property Bought API ends --------------------------------


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('bery server is running')
})

app.listen(port, () => {
  console.log('bery server is listening on port', port)
})