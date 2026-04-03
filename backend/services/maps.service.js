const axios = require("axios");

const getDistances = async (origin, hospitals) => {
  const results = [];

  for (const hospital of hospitals) {
    try {
      const url = `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${hospital.location.lng},${hospital.location.lat}`;

      const response = await axios.get(url, {
        params: { overview: false },
      });

      const route = response.data.routes[0];

      results.push({
        ...hospital.toObject(),
        distance_km: (route.distance / 1000).toFixed(1),
        eta_minutes: Math.ceil(route.duration / 60),
      });
    } catch (error) {
      // Fallback if OSRM fails
      results.push({
        ...hospital.toObject(),
        distance_km: "0",
        eta_minutes: 0,
      });
    }
  }

  return results;
};

module.exports = { getDistances };