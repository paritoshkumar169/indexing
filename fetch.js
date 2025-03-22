const axios = require('axios');
const config = require('./config');

const fetchAssetsByOwner = async (ownerAddress) => {
    try {
        const response = await axios.post(config.HELIUS_RPC_URL, {
            jsonrpc: "2.0",
            id: "my-id",
            method: "getAssetsByOwner",
            params: { ownerAddress, page: 1, limit: 1000 }
        });

        if (response.data.result) {
            await axios.post(`${config.FLASK_URL}/store-assets`, {
                assets: response.data.result.items
            });
        }
        return response.data.result?.items || [];
    } catch (error) {
        console.error('Error:', error.message);
        return [];
    }
};

fetchAssetsByOwner('Ai5spT4zukruzSm8m67ro1E2iuu92foU1fi1EvhMTPxj');
