import Head from 'next/dist/next-server/lib/head';
import { MongoClient, ObjectId } from 'mongodb';
import { Fragment } from 'react';

import MeetupDetail from '../../components/meetups/MeetupDetail';

function MeetupDetails(props) {
  return (
    <Fragment>
      <Head>
        <title>{props.meetupData.title}</title>
        <meta 
          name='description'
          content={props.meetupData.description} 
        />
      </Head>
      <MeetupDetail
        image={props.meetupData.image}
        title={props.meetupData.title}
        address={props.meetupData.address}
        description={props.meetupData.description}
      />
    </Fragment>
  );
}

export async function getStaticPaths() {
  const client = await MongoClient.connect('mongodb+srv://temona007:lifeisgood@cluster0.b7jcezz.mongodb.net/?retryWrites=true&w=majority');
  const db = client.db();
  const meetupsCollections = db.collection('meetups');
  const meetups = await meetupsCollections.find({}, { _id: 1 }).toArray();
  client.close();

  return {
    fallback: false,
    paths: meetups.map( meetup => ({ params: 
      { meetupId: meetup._id.toString() }, 
    })),
  };
}

export async function getStaticProps(context) {
  // fetch data for a single meetup

  const meetupId = context.params.meetupId;

  const client = await MongoClient.connect('mongodb+srv://temona007:lifeisgood@cluster0.b7jcezz.mongodb.net/?retryWrites=true&w=majority');
  const db = client.db();
  const meetupsCollections = db.collection('meetups');
  const selectedMeetup = await meetupsCollections.findOne({ 
    _id: ObjectId(meetupId), 
  });
  client.close();

  return {
    props: {
      meetupData: {
        id: selectedMeetup._id.toString(),
        image: selectedMeetup.image,
        title: selectedMeetup.title,
        address: selectedMeetup.address,
        description: selectedMeetup.description,
      },
    },
  };
}

export default MeetupDetails;