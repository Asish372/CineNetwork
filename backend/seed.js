const { sequelize, Category, Content, ContentCategory } = require('./models');
const dotenv = require('dotenv');

dotenv.config();

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Force sync to clear tables
    await sequelize.sync({ force: true });
    console.log('Database cleared and synced.');

    // 1. Create Categories
    const trendingCat = await Category.create({ title: 'Trending Now', type: 'mixed', displayOrder: 1 });
    const newReleasesCat = await Category.create({ title: 'New Releases', type: 'movie', displayOrder: 2 });
    const actionCat = await Category.create({ title: 'Action Movies', type: 'movie', displayOrder: 3 });
    const comedyCat = await Category.create({ title: 'Comedy Hits', type: 'movie', displayOrder: 4 });
    const shortsCat = await Category.create({ title: 'Viral Shorts', type: 'short', displayOrder: 5 });

    // 2. Create Content (Movies)
    const movie1 = await Content.create({
      type: 'movie',
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/9gk7admal4zlWH9AJ46r878Xpdf.jpg',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample video
      rating: 4.8,
      year: 2010,
      duration: '2h 28m',
      genre: 'Sci-Fi, Action',
      isVip: true,
      likes: 1200,
      views: 5000
    });

    const movie2 = await Content.create({
      type: 'movie',
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      rating: 4.9,
      year: 2008,
      duration: '2h 32m',
      genre: 'Action, Crime',
      isVip: false,
      likes: 2500,
      views: 10000
    });

    const movie3 = await Content.create({
      type: 'movie',
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
      thumbnailUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniL6E77NI6lCU6MxlNBvIx.jpg',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      rating: 4.7,
      year: 2014,
      duration: '2h 49m',
      genre: 'Sci-Fi, Adventure',
      isVip: true,
      likes: 1800,
      views: 8000
    });

    const movie4 = await Content.create({
        type: 'movie',
        title: 'Avengers: Endgame',
        description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
        thumbnailUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        rating: 4.9,
        year: 2019,
        duration: '3h 1m',
        genre: 'Action, Sci-Fi',
        isVip: true,
        likes: 3000,
        views: 15000
      });

    // 3. Create Content (Shorts)
    const short1 = await Content.create({
      type: 'short',
      title: 'Funny Cat',
      description: 'Hilarious cat fails.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      rating: 4.5,
      duration: '15s',
      genre: 'Comedy',
      likes: 500,
      views: 2000
    });

    const short2 = await Content.create({
        type: 'short',
        title: 'Epic Stunts',
        description: 'Amazing parkour stunts.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=500&q=80',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        rating: 4.8,
        duration: '30s',
        genre: 'Action',
        likes: 800,
        views: 3500
      });

    // 4. Associate Content with Categories
    // Trending: Inception, Dark Knight, Short1
    await trendingCat.addContents([movie1, movie2, short1]);
    
    // New Releases: Interstellar, Endgame
    await newReleasesCat.addContents([movie3, movie4]);

    // Action: Dark Knight, Inception, Endgame
    await actionCat.addContents([movie2, movie1, movie4]);

    // Shorts: Short1, Short2
    await shortsCat.addContents([short1, short2]);

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
