const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middlewares
app.use(express.json());
app.use(cors());

//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.spr5boq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Summer Camp Running");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //   await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const usersCollection = client.db("summerCampDB").collection("users");
    const classesCollection = client.db("summerCampDB").collection("classes");
    const selectedClassesCollection = client.db("summerCampDB").collection("selectedClasses");
    const enrolledClassesCollection = client.db("summerCampDB").collection("enrolledClasses");

    // USERS

    // get user by id
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // get user by email
    app.get("/users", async (req, res) => {
      try {
        const email = req.query.email;
        if(!email) {
          const result = await usersCollection.find().toArray()
          res.send(result)
          return
        }
        const query = { email: email };
        const result = await usersCollection.findOne(query);
        if(result){
          res.send(result);
        }else {
          res.send({})
        }
        
      } finally {

      }
      
    });

    // posting user info to database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // get users by role
    app.get("/usersRole/:role", async (req, res) => {
      const role = req.params.role;
      const query = { role: role };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });


    // Make user instructor
    app.patch('/users/instructor/:id', async(req,res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: 'instructor'
        }
      }

      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })


    // Make user admin
    app.patch('/users/admin/:id', async(req,res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }

      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })



    // CLASSES

    // posting class
    app.post("/class", async (req,res) => {
      const item = req.body;
      console.log(item)
      const result = await classesCollection.insertOne(item)
      res.send(result)
    })

    // get classes by instructor email
    app.get("/classes", async (req, res) => {
      try {
        const email = req.query.email;

        if(!email) {
          const result = await classesCollection.find().toArray()
          res.send(result)
          return
        }

        const query = { instructorEmail: email };
        const result = await classesCollection.find(query).toArray();
        if(result){
          res.send(result);
        }else {
          res.send([])
        }
        
      } finally {

      }
      
    });

    // Approve class
    app.patch('/classes/approve/:id', async(req,res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          status: 'approved'
        }
      }

      const result = await classesCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // Deny class
    app.patch('/classes/deny/:id', async(req,res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          status: 'denied'
        }
      }

      const result = await classesCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // Feedback
    app.patch('/classes/feedback/:id', async(req,res) => {
      const id = req.params.id
      const feedback = req.body;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: feedback
      }

      const result = await classesCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // Decrementing available seats
    app.patch('/classes/seats/:id', async(req,res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $inc: {
          seats: -1
        }
      }

      const result = await classesCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // Incrementing enrolled
    app.patch('/classes/enrolled/:id', async(req,res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $inc: {
          enrolled: 1
        }
      }

      const result = await classesCollection.updateOne(filter, updateDoc)
      res.send(result)
    })


    // SELECTED CLASSES

    // Get selected classes by email

    app.get("/selectedClasses", async (req, res) => {
      try {
        const email = req.query.email;
        if(!email) {
          const result = await selectedClassesCollection.find().toArray()
          res.send(result)
          return
        }
        const query = { studentEmail: email };
        const result = await selectedClassesCollection.find(query).toArray();
        if(result){
          res.send(result);
        }else {
          res.send([])
        }
        
      } finally {

      }
      
    });


    // Post selected classes
    app.post('/selectedClasses', async(req,res) => {
      const item = req.body;
      console.log(item)
      const result = await selectedClassesCollection.insertOne(item)
      res.send(result)
    })

    // Delete Selected Class
    app.delete('/selectedClasses/:id', async(req,res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await selectedClassesCollection.deleteOne(query);
      res.send(result);
    })


    // ENROLLED CLASSES

    // Get enrolled classes by email
    app.get("/enrolledClasses", async (req, res) => {
      try {
        const email = req.query.email;
        if(!email) {
          const result = await enrolledClassesCollection.find().toArray()
          res.send(result)
          return
        }
        const query = { studentEmail: email };
        const result = await enrolledClassesCollection.find(query).toArray();
        if(result){
          res.send(result);
        }else {
          res.send([])
        }
        
      } finally {

      }
      
    });

    // Post enrolled classes
    app.post('/enrolledClasses', async(req,res) => {
      const item = req.body;
      console.log(item)
      const result = await enrolledClassesCollection.insertOne(item)
      res.send(result)
    })




  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Listening to PORT: " + port);
});
