require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Space = require('./models/Space');
const Task = require('./models/Task');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clean up
    await User.deleteMany({ email: { $in: ['admin@demo.com', 'member@demo.com', 'dev@demo.com'] } });
    await Space.deleteMany({});
    await Task.deleteMany({});

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'admin'
    });

    const member1 = await User.create({
      name: 'Jane Developer',
      email: 'member@demo.com',
      password: 'password123',
      role: 'member'
    });

    const member2 = await User.create({
      name: 'Bob Designer',
      email: 'dev@demo.com',
      password: 'password123',
      role: 'member'
    });

    // Create a space
    const space = await Space.create({
      name: 'Website Redesign',
      description: 'Overhaul the company website with new brand identity.',
      createdBy: admin._id,
      members: [admin._id, member1._id, member2._id]
    });

    // Create tasks
    const yesterday = new Date(Date.now() - 86400000);
    const nextWeek = new Date(Date.now() + 7 * 86400000);
    const tomorrow = new Date(Date.now() + 86400000);

    await Task.create([
      {
        title: 'Set up space repository',
        description: 'Initialize Git repo and set up CI/CD pipeline.',
        status: 'Done',
        priority: 'High',
        isImportant: true,
        assignedTo: admin._id,
        spaceId: space._id,
        createdBy: admin._id,
        deadline: yesterday
      },
      {
        title: 'Design homepage mockup',
        description: 'Create Figma mockups for the new homepage layout.',
        status: 'In Progress',
        priority: 'High',
        isImportant: true,
        assignedTo: member2._id,
        spaceId: space._id,
        createdBy: admin._id,
        deadline: tomorrow
      },
      {
        title: 'Implement auth system',
        description: 'Build login, signup, and JWT-based auth.',
        status: 'In Progress',
        priority: 'High',
        isImportant: false,
        assignedTo: member1._id,
        spaceId: space._id,
        createdBy: admin._id,
        deadline: nextWeek
      },
      {
        title: 'Write unit tests',
        description: 'Add test coverage for all API endpoints.',
        status: 'Todo',
        priority: 'Medium',
        isImportant: false,
        assignedTo: member1._id,
        spaceId: space._id,
        createdBy: admin._id,
        deadline: nextWeek
      },
      {
        title: 'Optimize database queries',
        description: 'Profile and optimize slow queries, add indexes.',
        status: 'Todo',
        priority: 'Low',
        isImportant: false,
        assignedTo: admin._id,
        spaceId: space._id,
        createdBy: admin._id
      }
    ]);

    console.log('✅ Seed complete!');
    console.log('\nTest credentials (all passwords: password123):');
    console.log('  Admin:   admin@demo.com   / password123');
    console.log('  Member:  member@demo.com  / password123');
    console.log('  Member:  dev@demo.com     / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();