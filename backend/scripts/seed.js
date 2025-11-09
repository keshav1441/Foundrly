import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import Meme from '../models/Meme.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foundrly';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Idea.deleteMany({});
    await Meme.deleteMany({});

    // Create users
    const alice = await User.create({
      email: 'alice@foundrly.com',
      name: 'Alice Visionary',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'Visionary',
      bio: 'I see opportunities where others see problems. Mostly because I create the problems.',
      xp: 100,
    });

    const bob = await User.create({
      email: 'bob@foundrly.com',
      name: 'Bob Coder',
      avatar: 'https://i.pravatar.cc/150?img=2',
      role: 'Code',
      bio: 'I can build anything. Whether it should be built is a different question.',
      xp: 150,
    });

    const carol = await User.create({
      email: 'carol@foundrly.com',
      name: 'Carol Marketer',
      avatar: 'https://i.pravatar.cc/150?img=3',
      role: 'Marketing',
      bio: 'I can sell ice to penguins. And I have.',
      xp: 200,
    });

    const dave = await User.create({
      email: 'dave@foundrly.com',
      name: 'Dave VC',
      avatar: 'https://i.pravatar.cc/150?img=4',
      role: 'Fundless VC',
      bio: 'I invest in ideas. My own money? No, but I have connections.',
      xp: 50,
    });

    // Create ideas
    const ideas = [
      {
        name: 'CryptoChores',
        oneLiner: 'Blockchain-based chore tracking for kids. Earn tokens for doing dishes.',
        tags: ['blockchain', 'parenting', 'crypto'],
        memeImage: 'https://via.placeholder.com/300x200?text=CryptoChores',
        submittedBy: alice._id,
        swipeRightCount: 5,
        swipeLeftCount: 2,
      },
      {
        name: 'Rent-a-Plant',
        oneLiner: 'Subscription service for fake plants. Because real ones die.',
        tags: ['subscription', 'plants', 'sustainability'],
        memeImage: 'https://via.placeholder.com/300x200?text=Rent-a-Plant',
        submittedBy: bob._id,
        swipeRightCount: 8,
        swipeLeftCount: 1,
      },
      {
        name: 'DogTweet',
        oneLiner: 'Social network exclusively for dogs. Bark to post.',
        tags: ['social', 'pets', 'animals'],
        memeImage: 'https://via.placeholder.com/300x200?text=DogTweet',
        submittedBy: carol._id,
        swipeRightCount: 12,
        swipeLeftCount: 0,
      },
      {
        name: 'UberForPotholes',
        oneLiner: 'Crowdsourced pothole filling service. Like Uber, but for infrastructure.',
        tags: ['infrastructure', 'crowdsourcing', 'transport'],
        memeImage: 'https://via.placeholder.com/300x200?text=UberForPotholes',
        submittedBy: dave._id,
        swipeRightCount: 3,
        swipeLeftCount: 4,
      },
      {
        name: 'NFT-Toaster',
        oneLiner: 'Non-fungible toast art marketplace. Each slice is unique.',
        tags: ['nft', 'food', 'art'],
        memeImage: 'https://via.placeholder.com/300x200?text=NFT-Toaster',
        submittedBy: alice._id,
        swipeRightCount: 7,
        swipeLeftCount: 3,
      },
      {
        name: 'Coffee-as-a-Service',
        oneLiner: 'Monthly subscription for instant coffee. Because you deserve mediocrity.',
        tags: ['subscription', 'coffee', 'saas'],
        memeImage: 'https://via.placeholder.com/300x200?text=Coffee-as-a-Service',
        submittedBy: bob._id,
        swipeRightCount: 6,
        swipeLeftCount: 2,
      },
      {
        name: 'Rent-a-Friend-for-Meetings',
        oneLiner: 'Hire actors to attend your Zoom calls. Look more popular.',
        tags: ['productivity', 'social', 'remote-work'],
        memeImage: 'https://via.placeholder.com/300x200?text=Rent-a-Friend',
        submittedBy: carol._id,
        swipeRightCount: 9,
        swipeLeftCount: 1,
      },
      {
        name: 'SmartSocks',
        oneLiner: 'IoT socks that tweet your step count. Because your phone is too mainstream.',
        tags: ['iot', 'wearables', 'fitness'],
        memeImage: 'https://via.placeholder.com/300x200?text=SmartSocks',
        submittedBy: dave._id,
        swipeRightCount: 4,
        swipeLeftCount: 5,
      },
      {
        name: 'MemeStockAdvisor',
        oneLiner: 'AI that picks stocks based on memes. Because fundamentals are overrated.',
        tags: ['ai', 'finance', 'memes'],
        memeImage: 'https://via.placeholder.com/300x200?text=MemeStockAdvisor',
        submittedBy: alice._id,
        swipeRightCount: 10,
        swipeLeftCount: 2,
      },
      {
        name: 'GhostChef',
        oneLiner: 'Meal delivery from restaurants that closed. Authentic ghost kitchen experience.',
        tags: ['food', 'delivery', 'ghost-kitchen'],
        memeImage: 'https://via.placeholder.com/300x200?text=GhostChef',
        submittedBy: bob._id,
        swipeRightCount: 11,
        swipeLeftCount: 1,
      },
    ];

    const createdIdeas = await Idea.insertMany(ideas);

    // Create memes
    const memes = [
      {
        content: 'When your startup idea is so bad, it becomes good again.',
        imageUrl: 'https://via.placeholder.com/400x300?text=Meme+1',
        submittedBy: alice._id,
        upvotes: 15,
        upvotedBy: [bob._id, carol._id, dave._id],
      },
      {
        content: 'Pitch deck: Slide 1 - "We disrupt disruption"',
        imageUrl: 'https://via.placeholder.com/400x300?text=Meme+2',
        submittedBy: bob._id,
        upvotes: 22,
        upvotedBy: [alice._id, carol._id, dave._id],
      },
      {
        content: 'VC: "What\'s your moat?" Me: "We have no competitors because no one else is this stupid."',
        imageUrl: 'https://via.placeholder.com/400x300?text=Meme+3',
        submittedBy: carol._id,
        upvotes: 18,
        upvotedBy: [alice._id, bob._id, dave._id],
      },
      {
        content: 'Our burn rate is so high, we\'re warming the planet.',
        imageUrl: 'https://via.placeholder.com/400x300?text=Meme+4',
        submittedBy: dave._id,
        upvotes: 25,
        upvotedBy: [alice._id, bob._id, carol._id],
      },
      {
        content: 'We\'re pre-revenue, pre-product, pre-idea. But we have a domain name!',
        imageUrl: 'https://via.placeholder.com/400x300?text=Meme+5',
        submittedBy: alice._id,
        upvotes: 20,
        upvotedBy: [bob._id, carol._id, dave._id],
      },
    ];

    await Meme.insertMany(memes);

    console.log('✅ Seed data created successfully!');
    console.log(`   - ${await User.countDocuments()} users`);
    console.log(`   - ${await Idea.countDocuments()} ideas`);
    console.log(`   - ${await Meme.countDocuments()} memes`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

