const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000


//---- middleware----// 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5lehpdk.mongodb.net/?retryWrites=true&w=majority`;

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

        const taskCollection = client.db('taskHub').collection('tasks')

        // ----Data Read operation----//
        app.get('/tasks', async (req, res) => {
            try {
                const result = await taskCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch tasks' });
            }
        });

        //---- get the specific task by id ----//
        app.get('/tasks/:id', async (req, res) => {

            try {
                const id = req.params.id;
                if (!ObjectId.isValid(id)) {
                    return res.status(400).send({ error: 'Invalid task ID' });
                }

                const query = { _id: new ObjectId(id) };
                const result = await taskCollection.findOne(query);
                if (!result) {
                    return res.status(404).send({ error: 'Task not found' });
                }

                res.send(result);
            }
            catch (error) {
                res.status(500).send({ error: 'Failed to fetch task' });
            }
        });

        // ----data create operation & this method is for add task into the data base ----//
        app.post('/tasks', async (req, res) => {
            try {
                const newTask = req.body;

                // Check for required fields
                if (!newTask.title || !newTask.description || !newTask.status) {
                    return res.status(400).send({ error: 'Missing required fields' });
                }

                const result = await taskCollection.insertOne(newTask);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to create task' });
            }
        });


        // ----update method for task update---//

        app.patch('/tasks/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedTask = req.body;
                const query = { _id: new ObjectId(id) };

                // Check if the task exists
                const existingTask = await taskCollection.findOne(query);
                if (!existingTask) {
                    return res.status(404).send({ error: 'Task not found' });
                }

                // Validate the updated task data
                if (!updatedTask.title || !updatedTask.description) {
                    return res.status(400).send({ error: 'Missing required fields' });
                }

                const updateData = {
                    $set: {
                        title: updatedTask.title,
                        description: updatedTask.description,
                    },
                };

                const result = await taskCollection.updateOne(query, updateData);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to update task' });
            }
        });



        // -----Delete task method-----//

        app.delete('/tasks/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };

                // Check if the task exists
                const existingTask = await taskCollection.findOne(filter);
                if (!existingTask) {
                    return res.status(404).send({ error: 'Task not found' });
                }

                const result = await taskCollection.deleteOne(filter);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to delete task' });
            }
        });







        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


// ----server test function ---//
app.get('/', (req, res) => {
    res.send('Task Hub server is running........')
})

app.listen(port, () => {
    console.log(`Task hub is running on port:${port}`)
})