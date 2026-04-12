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
                    }
                }
            }
        });
        console.log(`Index '${indexName}' created.`);
     }
};

const indexDocument = async (doc) => {
    try {
        const indexName = 'docs_oposearch';

        const body = {
            nombre_doc: doc.nombre,
            cuerpo: doc.cuerpo,
            temas: doc.temas,
            titulos: doc.titulos,
            capitulos: doc.capitulos,
            articulos: doc.articulos
        }

        const response = await client.index({
            index: indexName,
            id: doc._id.toString(),
            document: body,
            refresh: true
        });

        consolelog(`Document indexed with ID: ${response.body._id}`);
        return response;
    } catch (error) {
        console.error('Error indexing document:', error.message);
        throw error;
    }
};

module.exports = {
    initIndex,
    indexDocument
}