const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

const caCertPath = process.env.ELASTIC_CA_CERT || path.join(__dirname, '../../certs/ca/ca.crt');

const client = new Client({
    node: process.env.ELASTIC_HOST || 'http://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USER,
        password: process.env.ELASTIC_PASSWORD
    },
    ssl: {
        ca: fs.readFileSync(caCertPath),
        rejectUnauthorized: false
    }
})

const checkConnection = async () => {
    try {
        const health = await client.cluster.health({});
        console.log('Elasticsearch cluster health:', health.body.status);
    } catch (error) {
        console.error('Error checking Elasticsearch connection:', error.message);
    }
};

module.exports = {
    client,
    checkConnection
}
