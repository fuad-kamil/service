const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../data_mock');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const schemasRegistry = {};

function applyDefaults(modelName, item) {
  if (!item) return null;
  const copy = { ...item };
  const schema = schemasRegistry[modelName.toLowerCase()];
  if (schema && schema.definition) {
    for (const key in schema.definition) {
      if (copy[key] === undefined) {
        const fieldDef = schema.definition[key];
        if (fieldDef && typeof fieldDef === 'object' && 'default' in fieldDef) {
          copy[key] = typeof fieldDef.default === 'function' ? fieldDef.default() : fieldDef.default;
        }
      }
    }
  }
  return copy;
}

function loadData(modelName) {
  const filePath = path.join(DB_DIR, `${modelName.toLowerCase()}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveData(modelName, data) {
  const filePath = path.join(DB_DIR, `${modelName.toLowerCase()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function wrapDocument(modelName, item) {
  if (!item) return null;
  const copy = applyDefaults(modelName, item);

  Object.defineProperty(copy, 'toObject', {
    value: function() {
      const obj = {};
      for (const key in this) {
        if (typeof this[key] !== 'function') {
          obj[key] = this[key];
        }
      }
      return obj;
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  Object.defineProperty(copy, 'save', {
    value: async function() {
      const items = loadData(modelName);
      const idx = items.findIndex(i => i._id === String(this._id));
      const cleanData = this.toObject();
      if (idx !== -1) {
        items[idx] = cleanData;
      } else {
        items.push(cleanData);
      }
      saveData(modelName, items);
      return this;
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  Object.defineProperty(copy, 'deleteOne', {
    value: async function() {
      const items = loadData(modelName);
      const filtered = items.filter(i => i._id !== String(this._id));
      saveData(modelName, filtered);
      return { deletedCount: 1 };
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  if (modelName.toLowerCase() === 'user') {
    Object.defineProperty(copy, 'comparePassword', {
      value: async function(pass) {
        const bcrypt = require('bcryptjs');
        if (!this.password) {
          const rawUsers = loadData('User');
          const rawUser = rawUsers.find(u => u._id === String(this._id));
          if (rawUser && rawUser.password) {
            return bcrypt.compare(pass, rawUser.password);
          }
        }
        return bcrypt.compare(pass, this.password || '');
      },
      enumerable: false,
      configurable: true,
      writable: true
    });
  }

  Object.defineProperty(copy, 'populate', {
    value: function(p) {
      const q = new Query(modelName, [item]);
      q.populate(p);
      return q.exec().then(res => wrapDocument(modelName, res[0]));
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  return copy;
}

class Query {
  constructor(modelName, array, filter = {}) {
    this.modelName = modelName;
    this.array = array;
    this.filter = filter;
    this._sort = null;
    this._skip = 0;
    this._limit = null;
    this._populates = [];
    this.isSingle = false;
  }

  populate(pathStr) {
    this._populates.push(pathStr);
    return this;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  select() {
    return this;
  }

  matchFilter(item, filter) {
    for (const key in filter) {
      const val = filter[key];
      if (key === '$text') {
        const search = val.$search?.toLowerCase() || '';
        const match = Object.values(item).some(v => 
          typeof v === 'string' && v.toLowerCase().includes(search)
        );
        if (!match) return false;
        continue;
      }
      if (key === '$or') {
        const matchesOr = val.some(f => this.matchFilter(item, f));
        if (!matchesOr) return false;
        continue;
      }
      if (typeof val === 'object' && val !== null) {
        if ('$gte' in val && item[key] < val.$gte) return false;
        if ('$lte' in val && item[key] > val.$lte) return false;
        if ('$regex' in val) {
          const regex = new RegExp(val.$regex, val.$options || '');
          if (!regex.test(item[key])) return false;
        }
        continue;
      }
      if (item[key] != val) return false;
    }
    return true;
  }

  async exec() {
    const dataWithDefaults = this.array.map(item => applyDefaults(this.modelName, item));
    let results = dataWithDefaults.filter(item => this.matchFilter(item, this.filter));

    // Sort
    if (this._sort) {
      const key = Object.keys(this._sort)[0];
      const dir = this._sort[key];
      results.sort((a, b) => {
        if (a[key] < b[key]) return dir === 1 ? -1 : 1;
        if (a[key] > b[key]) return dir === 1 ? 1 : -1;
        return 0;
      });
    }

    // Skip / Limit
    if (this._skip) {
      results = results.slice(this._skip);
    }
    if (this._limit) {
      results = results.slice(0, this._limit);
    }

    // Populate
    if (this._populates.length > 0) {
      results = results.map(item => {
        const copy = { ...item };
        this._populates.forEach(p => {
          if (p === 'categoryId') {
            const categories = loadData('Category');
            const cat = categories.find(c => c._id === String(item.categoryId));
            copy.categoryId = cat ? wrapDocument('Category', cat) : item.categoryId;
          }
          if (p === 'providerId') {
            const providers = loadData('Provider');
            const pr = providers.find(pr => pr._id === String(item.providerId));
            copy.providerId = pr ? wrapDocument('Provider', pr) : item.providerId;
          }
          if (p === 'userId') {
            const users = loadData('User');
            const u = users.find(u => u._id === String(item.userId));
            if (u) {
              const cleanUser = { ...u };
              delete cleanUser.password;
              copy.userId = wrapDocument('User', cleanUser);
            } else {
              copy.userId = item.userId;
            }
          }
          if (p === 'savedProviders') {
            const providers = loadData('Provider');
            copy.savedProviders = (item.savedProviders || []).map(id => {
              const pr = providers.find(pr => pr._id === String(id));
              return pr ? wrapDocument('Provider', pr) : id;
            });
          }
          if (p === 'serviceId') {
            const services = loadData('Service');
            const s = services.find(s => s._id === String(item.serviceId));
            copy.serviceId = s ? wrapDocument('Service', s) : item.serviceId;
          }
        });
        return copy;
      });
    }

    const mapped = results.map(item => wrapDocument(this.modelName, item));
    if (this.isSingle) {
      return mapped[0] || null;
    }
    return mapped;
  }

  then(onResolve, onReject) {
    return this.exec().then(onResolve, onReject);
  }
}

class MockModel {
  constructor(modelName, schema) {
    this.modelName = modelName;
    this.schema = schema;
    schemasRegistry[modelName.toLowerCase()] = schema;
  }

  find(filter = {}) {
    const data = loadData(this.modelName);
    return new Query(this.modelName, data, filter);
  }

  findOne(filter = {}) {
    const data = loadData(this.modelName);
    const q = new Query(this.modelName, data, filter);
    q.isSingle = true;
    return q;
  }

  findById(id) {
    return this.findOne({ _id: String(id) });
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const data = loadData(this.modelName);
    const idx = data.findIndex(i => i._id === String(id));
    if (idx === -1) return null;
    const updated = { ...data[idx], ...update, updatedAt: new Date().toISOString() };
    data[idx] = updated;
    saveData(this.modelName, data);
    return wrapDocument(this.modelName, updated);
  }

  async findOneAndUpdate(filter, update, options = {}) {
    const data = loadData(this.modelName);
    const q = new Query(this.modelName, data, filter);
    const results = await q.exec();
    if (results.length === 0) return null;
    const item = results[0];
    return this.findByIdAndUpdate(item._id, update, options);
  }

  async findByIdAndDelete(id) {
    const data = loadData(this.modelName);
    const idx = data.findIndex(i => i._id === String(id));
    if (idx === -1) return null;
    const deleted = data[idx];
    data.splice(idx, 1);
    saveData(this.modelName, data);
    return wrapDocument(this.modelName, deleted);
  }

  async create(obj) {
    const data = loadData(this.modelName);
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 9) + Date.now().toString().substring(8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...obj
    };

    if (newDoc.password && !newDoc.password.startsWith('$2a$')) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      newDoc.password = await bcrypt.hash(newDoc.password, salt);
    }

    data.push(newDoc);
    saveData(this.modelName, data);
    return wrapDocument(this.modelName, newDoc);
  }

  async countDocuments(filter = {}) {
    const data = loadData(this.modelName);
    const q = new Query(this.modelName, data, filter);
    const results = await q.exec();
    return results.length;
  }

  async insertMany(arr) {
    const data = loadData(this.modelName);
    const docs = arr.map(obj => ({
      _id: Math.random().toString(36).substring(2, 9) + Date.now().toString().substring(8),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...obj
    }));
    data.push(...docs);
    saveData(this.modelName, data);
    return docs.map(doc => wrapDocument(this.modelName, doc));
  }

  async deleteMany(filter = {}) {
    if (Object.keys(filter).length === 0) {
      saveData(this.modelName, []);
      return { deletedCount: 0 };
    }
    const data = loadData(this.modelName);
    const q = new Query(this.modelName, data, filter);
    const toDelete = await q.exec();
    const remaining = data.filter(item => !toDelete.some(d => d._id === item._id));
    saveData(this.modelName, remaining);
    return { deletedCount: toDelete.length };
  }

  async aggregate(pipeline) {
    const data = loadData(this.modelName);
    const matchStage = pipeline.find(stage => stage.$match);
    let results = matchStage ? data.filter(item => this.matchFilter(item, matchStage.$match)) : data;

    const groupStage = pipeline.find(stage => stage.$group);
    if (groupStage) {
      const avgRatingExp = groupStage.$group?.avgRating?.$avg;
      if (avgRatingExp) {
        const field = avgRatingExp.replace('$', '');
        const valid = results.filter(r => typeof r[field] === 'number');
        const sum = valid.reduce((acc, r) => acc + r[field], 0);
        return [{
          _id: null,
          avgRating: valid.length > 0 ? sum / valid.length : 0,
          count: results.length
        }];
      }
    }
    return results;
  }
}

module.exports = {
  connect: async () => {
    console.log('Running on Mock local MERN stack storage (JSON Files)!');
    return { connection: { host: 'JSON_MOCK_STORAGE' } };
  },
  model: (name, schema) => {
    return new MockModel(name, schema);
  },
  Schema: class {
    constructor(definition, options) {
      this.definition = definition;
      this.methods = {};
      this.statics = {};
    }
    pre(hook, fn) { return this; }
    post(hook, fn) { return this; }
    index(fields, options) { return this; }
    plugin(plugin, options) { return this; }
    virtual(name) {
      return {
        get: function() { return this; },
        set: function() { return this; }
      };
    }
    static get Types() {
      return { ObjectId: String };
    }
  },
  modelNames: () => [],
};
