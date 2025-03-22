const axios = require('axios');
const config = require('./config');

const setupWebhook = async (type, addresses) => {
    try {
        await axios.post(`${config.FLASK_URL}/create-webhook`, {
            type,
            addresses
        });
        return true;
    } catch (error) {
        console.error(`${type} webhook failed:`, error.response?.data?.error || error.message);
        return false;
    }
};

const setupAllWebhooks = async () => {
    await setupWebhook('nft_bids', [config.NFT_ADDRESS]);
    await setupWebhook('lending', [config.LENDING_ADDRESS]);
};

setupAllWebhooks();
