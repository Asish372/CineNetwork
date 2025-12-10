
const { sequelize, Content, Layout } = require('./models');

const SAMPLE_CONTENT = [
    {
        type: 'movie',
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
        thumbnailUrl: 'https://image.tmdb.org/t/p/w500/9gk7admal4zl67YkUYfNgS7G13h.jpg',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        year: 2010,
        genre: 'Sci-Fi, Action',
        rating: 4.8,
        status: 'published',
        isVip: false
    },
    {
        type: 'movie',
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        thumbnailUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        year: 2014,
        genre: 'Sci-Fi, Drama',
        rating: 4.9,
        status: 'published',
        isVip: true
    },
    {
        type: 'movie',
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham.',
        thumbnailUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        year: 2008,
        genre: 'Action, Crime',
        rating: 5.0,
        status: 'published',
        isVip: false
    },
     {
        type: 'movie',
        title: 'Avengers: Endgame',
        description: 'After the devastating events of Infinity War, the universe is in ruins.',
        thumbnailUrl: 'https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        year: 2019,
        genre: 'Action, Sci-Fi',
        rating: 4.9,
        status: 'published',
        isVip: true
    }
];

async function seedData() {
    try {
        // 1. Create Content
        console.log('Seeding Content...');
        const createdContent = [];
        for (const item of SAMPLE_CONTENT) {
            const [content] = await Content.findOrCreate({
                where: { title: item.title },
                defaults: item
            });
            createdContent.push(content);
        }
        console.log(`Seeded ${createdContent.length} items.`);

        // 2. Update Home Layout
        console.log('Updating Home Layout...');
        let layout = await Layout.findOne({ where: { page: 'home' } });
        if (!layout) {
            layout = await Layout.create({ page: 'home', heroContent: [], sections: [] });
        }

        // Set Hero Content (All items)
        layout.heroContent = createdContent;

        // Set Sections
        layout.sections = [
            {
                id: '1',
                title: 'Trending Now',
                type: 'manual',
                contentIds: createdContent // Using full objects as per frontend expectation
            },
            {
                id: '2',
                title: 'New Releases',
                type: 'new_arrivals',
                contentIds: createdContent
            },
             {
                id: '3',
                title: 'VIP Exclusives',
                type: 'manual',
                contentIds: createdContent.filter(c => c.isVip)
            }
        ];

        await layout.save();
        console.log('Home Layout Updated!');

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

seedData();
