const { default: axios } = require('axios');
const { onRequest } = require('firebase-functions/v2/https');

exports.findHistoryStocksBR = onRequest(
  { secrets: ['API_TOKEN', 'API_URL'], region: 'southamerica-east1' },
  (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const idsString = req.query.ids.split(',');
    const range = req.query.range;
    const interval = req.query.interval;
    const promises = [];

    // Using async generator to iterate over ids as a woraround to avoid the 20 ids limit, in this way we can get 20+ ids in a single request
    const asyncGen = (async function* () {
      // returns 20 elements at a time
      for (let i = 0; i < idsString.length; i += 20) {
        const ids = idsString.slice(i, i + 20);
        yield ids;
      }
    })();
    const stocksIterator = async () => {
      for await (const value of asyncGen) {
        await axios
          .get(
            `${process.env.API_URL}/quote/${value}?range=${range}&interval=${interval}&token=${process.env.API_TOKEN}&dividends=true`,
          )
          .then(response => {
            promises.push(response.data);
          });
      }
    };
    stocksIterator().then(() => {
      const data = promises;
      const joinResults = data.flatMap(item => item.results);
      // Case when the API returns 2 arrays(it happens when the stocks requested are more than 20) we'll join them
      // PS: We should apply this to all the other methods
      data[0].results = joinResults;
      if (data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          delete data[i];
        }
      }

      res.status(200).send(data);
    });
  },
);
