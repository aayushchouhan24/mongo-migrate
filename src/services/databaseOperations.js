const { MongoClient } = require('mongodb');

class DatabaseOperations {
  static async listDatabases(uri) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const adminDb = client.db().admin();
      const result = await adminDb.listDatabases();
      return result.databases;
    } finally {
      await client.close();
    }
  }

  static async listCollections(uri, dbName) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      return collections;
    } finally {
      await client.close();
    }
  }

  static async getCollectionStats(uri, dbName, collectionName) {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
      const count = await collection.countDocuments();
      const sampleDoc = await collection.findOne();
      return {
        collectionName,
        documentCount: count,
        sampleDocument: sampleDoc
      };
    } finally {
      await client.close();
    }
  }

  static async copySelectedCollections(sourceUri, targetUri, sourceDbName, targetDbName, selectedCollections, clearTarget = false) {
    const sourceClient = new MongoClient(sourceUri);
    const targetClient = new MongoClient(targetUri);

    try {
      await sourceClient.connect();
      await targetClient.connect();

      const sourceDb = sourceClient.db(sourceDbName);
      const targetDb = targetClient.db(targetDbName);

      const result = {
        sourceDb: sourceDbName,
        targetDb: targetDbName,
        collectionsCopied: [],
        totalDocuments: 0,
        startTime: new Date(),
        endTime: null
      };

      for (const collName of selectedCollections) {
        const sourceColl = sourceDb.collection(collName);
        const targetColl = targetDb.collection(collName);

        if (clearTarget) {
          await targetColl.deleteMany({});
        }

        const cursor = sourceColl.find({});
        const batch = [];
        const BATCH_SIZE = 1000;
        let docCount = 0;

        while (await cursor.hasNext()) {
          batch.push(await cursor.next());
          docCount++;

          if (batch.length >= BATCH_SIZE) {
            await targetColl.insertMany(batch, { ordered: false });
            batch.length = 0;
          }
        }

        if (batch.length > 0) {
          await targetColl.insertMany(batch, { ordered: false });
        }

        result.collectionsCopied.push({
          name: collName,
          documentCount: docCount
        });
        result.totalDocuments += docCount;
      }

      result.endTime = new Date();
      return result;

    } finally {
      await sourceClient.close();
      await targetClient.close();
    }
  }
}

module.exports = DatabaseOperations;
