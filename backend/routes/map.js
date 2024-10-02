const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/api/search', async (req, res) => {
    const addresses = req.query.addresses ? req.query.addresses.split(',') : [];

    if (addresses.length === 0) {
        return res.status(400).json({ msg: 'Napaka pri pridobitvi koordinat.' });
    }

    try {
        const coordinates = await Promise.all(addresses.map(async (address) => {
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: address,
                    format: 'json'
                }
            });

            if (response.data.length !== 0) {
               const { lat, lon } = response.data[0];
               return { address, lat: parseFloat(lat), lon: parseFloat(lon), found: true };
            } else {
                return { address, found: false };
            }
        }));

        res.json(coordinates);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: 'Pridobivanje koordinat ni uspelo.' });
    }
});

module.exports = router;
