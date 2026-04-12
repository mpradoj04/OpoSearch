const { client } = require('../config/elasticsearch');

const initIndex = async () => {
    const indexName = 'docs_oposearch';

    const exists = await client.indices.exists({ index: indexName });

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
        console.log(`Index '${indexName}' created.`);
     }
};

module.exports = {
    initIndex,
}