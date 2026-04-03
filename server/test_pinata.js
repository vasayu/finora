const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

async function test() {
    try {
        const formData = new FormData();
        formData.append('file', Buffer.from('hello world'), { filename: 'test.txt' });

        const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'pinata_api_key': process.env.PINATA_APIKEY,
                'pinata_secret_api_key': process.env.PINATA_SECRETKEY,
                ...formData.getHeaders()
            }
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}
test();
