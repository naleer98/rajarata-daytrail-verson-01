const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Place = require('./models/Place');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    const adminName =
      process.env.SEED_ADMIN_NAME || 'RajaRata Administrator';

    const adminEmail =
      process.env.SEED_ADMIN_EMAIL || 'admin@rajaratadaytrail.lk';

    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    const existingAdmin = await User.findOne({
      email: adminEmail
    });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }

      console.log(`Keeping existing admin user: ${adminEmail}`);
    } else {
      if (!adminPassword || adminPassword.length < 8) {
        throw new Error(
          'Set SEED_ADMIN_PASSWORD (minimum 8 characters) before creating the admin user.'
        );
      }

      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });

      console.log(`Created admin user: ${adminEmail}`);
    }

    console.log('Syncing 10 verified Anuradhapura places...');

    const places = [
      {
        name: 'Jaya Sri Maha Bodhi',
        category: 'Religious',
        description:
          'A sacred Buddhist pilgrimage site centered on the sacred Bodhi tree planted in 288 BC, one of the oldest human-planted trees in the world.',
        address: 'Sacred City, Anuradhapura',
        coordinates: {
          lat: 8.3448,
          lng: 80.397
        },
        openingTime: '06:00',
        closingTime: '21:00',
        visitDuration: 60,
        entryFee: 'Free (Donations accepted)',
        contactNumber: '+94 25 222 2234',
        image: '/uploads/jaya-sri-maha-bodhi.webp',
        images: ['/uploads/jaya-sri-maha-bodhi.webp'],
        travelTips:
          'Remove shoes and hats before entering the sacred precinct. Wear white or modest clothing covering shoulders and knees.',
        dressCode:
          'Strict white or modest attire covering shoulders and knees. Footwear removed at entry.',
        facilities: [
          'Shoe Counters',
          'Drinking Water',
          'Restrooms'
        ],
        bestVisitTime:
          'Early Morning (06:30 - 08:30) or Evening Pooja (18:00)',
        distanceFromHome: 20
      },
      {
        name: 'Ruwanwelisaya',
        category: 'Heritage',
        description:
          'A magnificent stupa built by King Dutugemunu in 140 BC, revered for its architectural grandeur, elephant wall, and deep spiritual significance.',
        address: 'Sacred City, Anuradhapura',
        coordinates: {
          lat: 8.35,
          lng: 80.3961
        },
        openingTime: '05:30',
        closingTime: '21:00',
        visitDuration: 75,
        entryFee: 'Free',
        contactNumber: '+94 25 222 1120',
        image: '/uploads/ruwanwelisaya.jpg',
        images: ['/uploads/ruwanwelisaya.jpg'],
        travelTips:
          'Stone courtyard becomes hot at noon. Visit in evening hours to experience illumination and chanting.',
        dressCode:
          'White clothing covering shoulders and knees.',
        facilities: [
          'Shoe Storage',
          'Restrooms',
          'Evening Lighting'
        ],
        bestVisitTime: 'Late Afternoon (17:00 - 19:30)',
        distanceFromHome: 18
      },
      {
        name: 'Isurumuniya Temple',
        category: 'Cultural',
        description:
          'A renowned 3rd-century BC rock temple celebrated for exquisite rock carvings including the Isurumuniya Lovers and elephant reliefs.',
        address: 'Near Tissa Wewa, Anuradhapura',
        coordinates: {
          lat: 8.334,
          lng: 80.39
        },
        openingTime: '07:00',
        closingTime: '18:00',
        visitDuration: 50,
        entryFee: 'LKR 500 (Foreigners) / Free (Locals)',
        contactNumber: '+94 25 222 3012',
        image: '/uploads/isurumuniya.jpg',
        images: ['/uploads/isurumuniya.jpg'],
        travelTips:
          'Climb the rock terrace for a view of Tissa Wewa reservoir. Museum displays original stone carvings.',
        dressCode:
          'Shoulders and knees must be covered.',
        facilities: [
          'Museum',
          'Parking',
          'Souvenir Stalls'
        ],
        bestVisitTime: 'Morning (08:00 - 10:30)',
        distanceFromHome: 15
      },
      {
        name: 'Jetavanaramaya',
        category: 'Heritage',
        description:
          'A monumental brick stupa that was once one of the tallest structures in the ancient world.',
        address: 'Sacred City, Anuradhapura',
        coordinates: {
          lat: 8.3516,
          lng: 80.4034
        },
        openingTime: '07:00',
        closingTime: '18:30',
        visitDuration: 60,
        entryFee: 'Free / Museum LKR 1000',
        contactNumber: '+94 25 222 4580',
        image: '/uploads/jetavanaramaya.jpg',
        images: ['/uploads/jetavanaramaya.jpg'],
        travelTips:
          'Visit the adjacent Jetavana Museum to view ancient pottery and relic chamber artifacts.',
        dressCode: 'Modest temple attire.',
        facilities: [
          'Archaeological Museum',
          'Parking Lot'
        ],
        bestVisitTime: 'Morning or Late Afternoon',
        distanceFromHome: 24
      },
      {
        name: 'Abhayagiri Stupa & Monastic Complex',
        category: 'Heritage',
        description:
          'An expansive ancient monastic complex housing an enormous stupa, stone moonstones, twin ponds, and ancient residential colleges.',
        address: 'Northern Sacred City, Anuradhapura',
        coordinates: {
          lat: 8.3712,
          lng: 80.3958
        },
        openingTime: '07:00',
        closingTime: '18:00',
        visitDuration: 90,
        entryFee: 'Free',
        contactNumber: '+94 25 222 1890',
        image: '/uploads/abhayagiri.jpg',
        images: ['/uploads/abhayagiri.jpg'],
        travelTips:
          'Complex spans over 500 acres; renting a bicycle is recommended.',
        dressCode: 'Respectful attire recommended.',
        facilities: [
          'Bicycle Parking',
          'Museum'
        ],
        bestVisitTime: 'Morning (07:30 - 10:00)',
        distanceFromHome: 25
      },
      {
        name: 'Thuparamaya',
        category: 'Religious',
        description:
          'The first Buddhist stupa constructed in Sri Lanka after the introduction of Buddhism, housing the sacred collarbone relic.',
        address: 'Sacred City, Anuradhapura',
        coordinates: {
          lat: 8.3556,
          lng: 80.3964
        },
        openingTime: '06:00',
        closingTime: '20:00',
        visitDuration: 45,
        entryFee: 'Free',
        contactNumber: '+94 25 222 0011',
        image: '/uploads/thuparamaya.jpg',
        images: ['/uploads/thuparamaya.jpg'],
        travelTips:
          'Observe the concentric rings of decorative stone pillars surrounding the stupa.',
        dressCode: 'White or modest temple clothing.',
        facilities: [
          'Shoe Counter',
          'Flowers Vendor'
        ],
        bestVisitTime: 'Early Morning or Sunset',
        distanceFromHome: 21
      },
      {
        name: 'Kuttam Pokuna (Twin Ponds)',
        category: 'Heritage',
        description:
          'Ancient twin bathing tanks demonstrating sophisticated hydraulic engineering, underground filtration, and stone craftsmanship.',
        address: 'Abhayagiri Complex, Anuradhapura',
        coordinates: {
          lat: 8.3708,
          lng: 80.4042
        },
        openingTime: '07:00',
        closingTime: '18:00',
        visitDuration: 35,
        entryFee: 'Free',
        contactNumber: '+94 25 222 1100',
        image: '/uploads/kuttam-pokuna.jpg',
        images: ['/uploads/kuttam-pokuna.jpg'],
        travelTips:
          'Great photography spot for stone Naga motifs. Bathing in the ponds is strictly prohibited.',
        dressCode: 'Casual / Modest',
        facilities: [
          'Shaded Seating',
          'Information Signage'
        ],
        bestVisitTime: 'Anytime during daylight',
        distanceFromHome: 6
      },
      {
        name: 'Samadhi Buddha Statue',
        category: 'Religious',
        description:
          'A world-famous 4th-century dolomite marble Buddha statue depicted in meditation posture, renowned for serene artistic grace.',
        address: 'Mahamevnawa Park, Anuradhapura',
        coordinates: {
          lat: 8.3622,
          lng: 80.3986
        },
        openingTime: '06:00',
        closingTime: '18:30',
        visitDuration: 30,
        entryFee: 'Free',
        contactNumber: '+94 25 222 3344',
        image: '/uploads/samadhi-buddha.jpg',
        images: ['/uploads/samadhi-buddha.jpg'],
        travelTips:
          'Maintain silence. Photography with back turned directly facing the statue is prohibited.',
        dressCode:
          'Respectful temple attire. Remove shoes before stepping onto marble deck.',
        facilities: [
          'Shoe Storage',
          'Quiet Meditation Zone'
        ],
        bestVisitTime: 'Morning or Late Afternoon',
        distanceFromHome: 12
      },
      {
        name: 'Tissa Wewa',
        category: 'Nature',
        description:
          'An ancient artificial reservoir constructed in the 3rd century BC, offering breezy lakeside walking paths.',
        address: 'Tissa Wewa Embankment, Anuradhapura',
        coordinates: {
          lat: 8.328,
          lng: 80.384
        },
        openingTime: '05:00',
        closingTime: '19:30',
        visitDuration: 45,
        entryFee: 'Free',
        contactNumber: 'N/A',
        image: '/uploads/tissa-wewa.jpg',
        images: ['/uploads/tissa-wewa.jpg'],
        travelTips:
          'Ideal location for a relaxed end-of-day stop. Snack vendors operate along the dam embankment.',
        dressCode: 'Casual outdoor clothing',
        facilities: [
          'Walking Trail',
          'Snack Vendors'
        ],
        bestVisitTime: 'Sunset (17:30 - 18:30)',
        distanceFromHome: 18
      },
      {
        name: 'Mihintale',
        category: 'Heritage',
        description:
          'A sacred mountain peak revered as the cradle of Buddhism in Sri Lanka, featuring stone steps, stupas, and scenic rock vistas.',
        address: 'Mihintale, Anuradhapura District',
        coordinates: {
          lat: 8.3508,
          lng: 80.509
        },
        openingTime: '06:00',
        closingTime: '19:00',
        visitDuration: 120,
        entryFee: 'LKR 1000 (Foreigners) / Free (Locals)',
        contactNumber: '+94 25 226 6230',
        image: '/uploads/mihintale.jpg',
        images: ['/uploads/mihintale.jpg'],
        travelTips:
          'Stair climbing involved. Carry drinking water and wear comfortable walking shoes.',
        dressCode:
          'Shoulders and knees covered for temple summit.',
        facilities: [
          'Parking Lot',
          'Water Taps',
          'Restrooms'
        ],
        bestVisitTime:
          'Late Afternoon for sunset views over Anuradhapura plains',
        distanceFromHome: 15
      }
    ];

    await Promise.all(
      places.map((place) =>
        Place.findOneAndUpdate(
          { name: place.name },
          {
            $set: {
              ...place,
              isActive: true
            }
          },
          {
            upsert: true,
            returnDocument: 'after',
            runValidators: true,
            setDefaultsOnInsert: true
          }
        )
      )
    );

    console.log(
      `Successfully synced ${places.length} verified Anuradhapura places!`
    );
  } catch (error) {
    console.error('Seeding error:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedData();