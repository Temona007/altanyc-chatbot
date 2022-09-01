import Head from 'next/head';

import { MongoClient } from 'mongodb';

import MeetupList from '../components/meetups/MeetupList';
import { Fragment } from 'react';

const HomePage = (props) => {
    return (
        <Fragment>
            <Head>
                <title>React Meetup</title>
                <meta 
                    name='description'
                    content='Cool react meetups!' 
                />
            </Head>
            <MeetupList meetups={props.meetups} />
        </Fragment>
    );
};

// export async function getServerSideProps(context) {
//     const req = context.req;
//     const res = context.res;


//     // fetch data from API
//     // run server side code here

//     return {
//         props: {
//             meetups: DUMMY_MEETS 
//         }
//     };
// }

export async function getStaticProps() {
    // fetch data from DB
    const client = await MongoClient.connect('mongodb+srv://temona007:lifeisgood@cluster0.b7jcezz.mongodb.net/?retryWrites=true&w=majority');
    const db = client.db();
    const meetupsCollections = db.collection('meetups');
    const meetups = await meetupsCollections.find().toArray();
    client.close();

    return {
        props: {
            meetups: meetups.map( meetup => ({
                title: meetup.title,
                address: meetup.address,
                image: meetup.image,
                id: meetup._id.toString(),
            })) 
        },
        revalidate: 1
    };
}

export default HomePage;