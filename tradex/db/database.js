const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.collections = {
      users: 'users.json',
      stocks: 'stocks.json',
      portfolios: 'portfolios.json',
      transactions: 'transactions.json',
      watchlists: 'watchlists.json'
    };
  }

  _getFilePath(collectionName) {
    const filename = this.collections[collectionName.toLowerCase()] || `${collectionName}.json`;
    return path.join(DB_DIR, filename);
  }

  _readCollection(collectionName) {
    const filePath = this._getFilePath(collectionName);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error(`Error reading ${collectionName}:`, err);
      return [];
    }
  }

  _writeCollection(collectionName, data) {
    const filePath = this._getFilePath(collectionName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Find documents matching query filter object
   */
  find(collectionName, filter = {}) {
    const items = this._readCollection(collectionName);
    return items.filter(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Find single document
   */
  findOne(collectionName, filter = {}) {
    const results = this.find(collectionName, filter);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Insert new document
   */
  insertOne(collectionName, doc) {
    const items = this._readCollection(collectionName);
    const newDoc = {
      _id: doc._id || crypto.randomBytes(12).toString('hex'),
      createdAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    this._writeCollection(collectionName, items);
    return newDoc;
  }

  /**
   * Update single matching document
   */
  updateOne(collectionName, filter = {}, update = {}) {
    const items = this._readCollection(collectionName);
    const index = items.findIndex(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    items[index] = updatedItem;
    this._writeCollection(collectionName, items);
    return updatedItem;
  }

  /**
   * Delete matching documents
   */
  deleteOne(collectionName, filter = {}) {
    const items = this._readCollection(collectionName);
    const index = items.findIndex(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });

    if (index === -1) return false;

    items.splice(index, 1);
    this._writeCollection(collectionName, items);
    return true;
  }

  /**
   * Delete multiple documents matching filter
   */
  deleteMany(collectionName, filter = {}) {
    let items = this._readCollection(collectionName);
    const initialCount = items.length;
    items = items.filter(item => {
      for (const key in filter) {
        if (item[key] === filter[key]) {
          return false;
        }
      }
      return true;
    });
    this._writeCollection(collectionName, items);
    return initialCount - items.length;
  }
}

module.exports = new Database();
