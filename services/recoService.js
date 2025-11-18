// services/recoService.js
const restaurantModel = require('../models/restaurantModel');
const { normalizeDistanceScore, normalizeRatingScore } = require('../utils/normalizer');

// Bobot untuk setiap faktor dalam Algoritma Scoring
const WEIGHT_DISTANCE = 0.5;
const WEIGHT_RATING = 0.3;
const WEIGHT_PREFERENCE = 0.2;

async function getRecommendations(userId, userLat, userLon, maxDistance) {

    // 1. Ambil data dasar dari DB (Model Layer)
    const nearbyRestos = await restaurantModel.getNearbyRestaurants(userLat, userLon, maxDistance);

    // 2. Ambil preferensi pengguna
    const userPrefs = restaurantModel.getUserPreferences(userId);

    // 3. Terapkan Algoritma Scoring (Weighted Sum Model)
    const scoredRestos = nearbyRestos.map(resto => {
        // Ambil skor preferensi pengguna untuk kategori restoran
        const prefValue = userPrefs[resto.category] || 0; // Default 0 jika tidak ada preferensi

        // Menghitung Skor Normalisasi (0 - 1)
        const S_d = normalizeDistanceScore(resto.distance_km, maxDistance);
        const S_r = normalizeRatingScore(resto.avg_rating);
        const S_p = normalizeRatingScore(prefValue);

        // Menghitung Skor Akhir (Skor Rekomendasi)
        const finalScore = (WEIGHT_DISTANCE * S_d) +
        (WEIGHT_RATING * S_r) +
        (WEIGHT_PREFERENCE * S_p);

        return {
            id: resto.id,
            name: resto.name,
            category: resto.category,
            avg_rating: resto.avg_rating,
            distance_km: resto.distance_km.toFixed(2), // Pembulatan jarak
            finalScore: finalScore.toFixed(4) // Pembulatan skor
        };  
    });

    // 4. Pengurutan Akhir (Algoritma Sorting: Descending Score)
    // Diurutkan berdasarkan skor tertinggi
    scoredRestos.sort((a, b) => b.finalScore - a.finalScore);

    return scoredRestos;
}

module.exports = { getRecommendations };