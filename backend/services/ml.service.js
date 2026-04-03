const axios = require("axios");

const getPrediction = async (data) => {
    const res = await axios.post("http://localhost:8000/predict", data);
    return res.data;
};

const analyzeSceneImage = async (base64Image) => {
    const res = await axios.post("http://localhost:8000/predict/image", { image: base64Image });
    return res.data;
};

module.exports = { getPrediction, analyzeSceneImage };