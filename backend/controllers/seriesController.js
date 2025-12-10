const { Season, Episode } = require('../models');

// --- SEASON CONTROLLERS ---

exports.getSeasons = async (req, res) => {
    try {
        const { seriesId } = req.params;
        const seasons = await Season.findAll({
            where: { contentId: seriesId },
            include: [{ model: Episode, as: 'episodes', order: [['episodeNumber', 'ASC']] }],
            order: [['seasonNumber', 'ASC']]
        });
        res.json(seasons);
    } catch (error) {
        console.error('Error fetching seasons:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createSeason = async (req, res) => {
    try {
        const { seriesId } = req.params;
        const season = await Season.create({ ...req.body, contentId: seriesId });
        res.status(201).json(season);
    } catch (error) {
        console.error('Error creating season:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateSeason = async (req, res) => {
    try {
        const { id } = req.params;
        await Season.update(req.body, { where: { id } });
        const updatedSeason = await Season.findByPk(id);
        res.json(updatedSeason);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteSeason = async (req, res) => {
    try {
        const { id } = req.params;
        await Season.destroy({ where: { id } });
        res.json({ message: 'Season deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- EPISODE CONTROLLERS ---

exports.createEpisode = async (req, res) => {
    try {
        const { seasonId } = req.params;
        const episode = await Episode.create({ ...req.body, seasonId });
        res.status(201).json(episode);
    } catch (error) {
        console.error('Error creating episode:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        await Episode.update(req.body, { where: { id } });
        const updatedEpisode = await Episode.findByPk(id);
        res.json(updatedEpisode);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        await Episode.destroy({ where: { id } });
        res.json({ message: 'Episode deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
