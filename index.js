const express = require('express')
const app = express()
const cors = require('cors');
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

    const propertyCollection = client.db('Bery_DB').collection('property')
    const reviewsCollection = client.db('Bery_DB').collection('review')
    const wishlistCollection = client.db('Bery_DB').collection('wishlist')
    const propertyBoughtCollection = client.db('Bery_DB').collection('property_bought')


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


    // get offered properties in property bought list API
    app.get('/property_bought', async (req, res) => {
      const result = await propertyBoughtCollection.find().toArray()
      res.send(result)
    })

    // get offered properties in property bought list by USER email
    app.get('/property_bought', async (req, res) => {
      const email = req.query.email
      const query = { BuyerEmail: email }
      const result = await wishlistCollection.find(query).toArray();
      res.send(result)
    })

    // add offered properties to property bought list
    app.post('/property_bought', async (req, res) => {
      const offeredProperty = req.body
      const result = await propertyBoughtCollection.insertOne(offeredProperty)
      res.send(result)
    })


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