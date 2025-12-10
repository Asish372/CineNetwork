const { Layout, Content } = require('../models');

exports.getLayout = async (req, res) => {
    try {
        const { page } = req.params;
        let layout = await Layout.findOne({ where: { page } });
        
        if (!layout) {
            // Create default if not exists
            layout = await Layout.create({ 
                page, 
                heroContent: [], 
                sections: [] 
            });
        }

        // Helper to parse if string
        const parseIfNeeded = (data) => {
             if (typeof data === 'string') {
                 try { return JSON.parse(data); } catch(e) { return []; }
             }
             return data;
        };

        // Return parsed layout
        const responseLayout = layout.toJSON();
        responseLayout.heroContent = parseIfNeeded(layout.heroContent);
        responseLayout.sections = parseIfNeeded(layout.sections);

        res.json(responseLayout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch layout' });
    }
};

exports.saveLayout = async (req, res) => {
    try {
        const { page } = req.params;
        const { heroContent, sections } = req.body;

        let layout = await Layout.findOne({ where: { page } });
        if (layout) {
            if(heroContent) layout.heroContent = heroContent;
            if(sections) layout.sections = sections;
            await layout.save();
        } else {
            layout = await Layout.create({ page, heroContent, sections });
        }

        // Helper to parse if string (Duplicate logic, could execute as utility)
        const parseIfNeeded = (data) => {
             if (typeof data === 'string') {
                 try { return JSON.parse(data); } catch(e) { return []; }
             }
             return data;
        };

        // Emit real-time update with PARSED data
        const io = req.app.get('io');
        const layoutData = layout.toJSON();
        layoutData.heroContent = parseIfNeeded(layout.heroContent); 
        layoutData.sections = parseIfNeeded(layout.sections);

        console.log(`Emitting layout_updated for page: ${page} with ${layoutData.heroContent?.length || 0} hero items`); // Debug Log
        io.emit('layout_updated', { page, layout: layoutData });

        res.json({ message: 'Layout updated', layout: layoutData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update layout' });
    }
};

// Start a search for content to populate slider
exports.searchContentForLayout = async (req, res) => {
    try {
        const { query, type } = req.query;
        // If no query, return latest content (limit 50)
        
        const { Op } = require('sequelize');
        
        const whereClause = {};
        
        if (query) {
             whereClause.title = { [Op.like]: `%${query}%` };
        }

        if (type && type !== 'all') {
            whereClause.type = type;
        }

        const content = await Content.findAll({
            where: whereClause,
            limit: 50, // Increased limit for "all content" view
            order: [['createdAt', 'DESC']], // recent first
            attributes: ['id', 'title', 'type', 'posterUrl', 'thumbnailUrl', 'year', 'isVip']
        });
        res.json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
};
