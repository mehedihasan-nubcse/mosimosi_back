import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class MergeService {
  private readonly logger = new Logger(MergeService.name);
  private mainDb: Db;

  constructor() {}

  async connectToDatabase(uri: string): Promise<Db> {
    const client = new MongoClient(uri);
    await client.connect();
    this.logger.log(`Connected to database: ${uri}`);
    return client.db();
  }

  async initialize() {
    const mainDbUri =
      'mongodb://ikbalsazib11:IKBALsazib11@localhost:27017/inventory-pos?authSource=admin';
    this.mainDb = await this.connectToDatabase(mainDbUri);
  }

  async mergeSubDatabase(subDbUri: string): Promise<void> {
    const subDb = await this.connectToDatabase(subDbUri);

    // Fetch all collections in the sub-database
    const collections = await subDb.listCollections().toArray();

    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const subCollection = subDb.collection(collectionName);
      const mainCollection = this.mainDb.collection(collectionName);

      const documents = await subCollection.find().toArray();
      const idMapping = {}; // Old _id to new _id mapping

      for (const doc of documents) {
        const oldId = doc._id;
        delete doc._id;

        // For 'products' collection, store the old _id in the 'old_id' field
        if (collectionName === 'products') {
          doc.old_id = oldId;
        }

        // Insert into the main database and map new _id
        const { insertedId } = await mainCollection.insertOne(doc);
        idMapping[oldId.toHexString()] = insertedId;
      }

      // Update references in other collections
      for (const refCollectionInfo of collections) {
        const refCollectionName = refCollectionInfo.name;
        const refCollection = this.mainDb.collection(refCollectionName);

        // Update single product references
        await refCollection.updateMany(
          { 'product._id': { $in: Object.keys(idMapping) } },
          {
            $set: {
              'product._id': idMapping['product._id'],
            },
          },
        );

        // Update array of product references
        await refCollection.updateMany(
          { 'products._id': { $in: Object.keys(idMapping) } },
          {
            $set: {
              products: {
                $map: {
                  input: '$products',
                  as: 'product',
                  in: {
                    $mergeObjects: [
                      '$$product',
                      { _id: idMapping['$$product._id'] },
                    ],
                  },
                },
              },
            },
          },
        );

        // console.log('Done -> ' + Date.now());
      }
    }

    this.logger.log(`Merged sub-database: ${subDbUri}`);
  }
}
