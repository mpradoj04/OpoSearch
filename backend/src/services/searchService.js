const { client } = require('../config/elasticsearch');
const logger = require('../config/logger');

const initIndex = async () => {
    const indexName = 'docs_oposearch';

    const exists = await client.indices.exists({ index: indexName });

    try {
        if (!exists || !exists.body) {
            await client.indices.create({
                index: indexName,
                body: {
                    mappings: {
                        properties: {
                            nombre_doc: { type: 'text', analyzer: 'spanish'},
                            cuerpo: {type: 'keyword'},
                            temas: {type: 'keyword'},
                            titulos: {type: 'text', analyzer: 'spanish'},
                            capitulos: {type: 'text', analyzer: 'spanish'},
                            articulos: {type: 'text', analyzer: 'spanish'},
                            contenido: { type: 'text', analyzer: 'spanish' }

                        }
                    }
                }
            });

            logger.info(`Index '${indexName}' created successfully.`, {
                context: 'ElasticsearchService',
                index: indexName
            });
        } else{
            logger.info(`Index '${indexName}' already exists.`, {
                context: 'ElasticsearchService',
                index: indexName
            });
        }
    } catch (error) {
        logger.error(`Error initializing index '${indexName}': ${error.message}`, {
            context: 'ElasticsearchService',
            index: indexName,
            message: error.message,
            stack: error.stack
        });
    }
};

module.exports = {
    initIndex,
}