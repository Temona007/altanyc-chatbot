import { MongoClient } from "mongodb";

// site.com/api/new-meetup
// only POST request

async function handler (req, res) {
    if (req.method === 'POST') {
        const data = req.body;

        const { title, image, address, description} = data;

        const client = await MongoClient.connect('mongodb+srv://temona007:lifeisgood@cluster0.b7jcezz.mongodb.net/?retryWrites=true&w=majority');
        
        const db = client.db();

        const meetupsCollections = db.collection('meetups');

        const result = await meetupsCollections.insertOne(data);

        console.log(result);

        client.close();

        res.status(201).json({ message: 'Meetup inserted!' });
    }
};

export default handler;