// routes/recoRoutes.js
const express = require('express');
const router = express.Router();
const recoService = require('../services/recoService');

router.get('/', async (req, res) => {

    try {
        const { userId, lat, lon, maxDistance = 10 } = req.query; // Default max 10km

    // Validasi input
    if (!userId || !lat || !lon) {
        return res.status(400).json({
            message: "Require userId, lat (latitude), and lon (longitude)." 
        }); 
    }

    const recommendations = await recoService.getRecommendations(
    userId,
    parseFloat(lat),
    parseFloat(lon),
    parseInt(maxDistance)
    );

    res.json({
        user_input: { userId, lat, lon, maxDistance },
        recommendations: recommendations
    });

    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({
            message: "Internal server error.",
            details: error.message
        });
    }
});

module.exports = router;