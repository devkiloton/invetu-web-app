const { default: axios } = require('axios');
const { onRequest } = require('firebase-functions/v2/https');

exports.findFiats = onRequest(
  {
    secrets: ['API_CRYPTO_TOKEN', 'API_CRYPTO_URL'],
    region: 'southamerica-east1',
  },
  (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    axios
      .get(`${process.env.API_CRYPTO_URL}/fiats`)
      .then(response => res.status(200).send(response.data));
  },
);