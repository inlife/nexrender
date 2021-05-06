const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL
});

/* internal methods */
const scan = parser => {
  let cursor = '0';
  let results = [];

  const _scan = () => {
    return client.scan(cursor, 'MATCH', 'nexjob:*', 'COUNT', '10', (err, reply) => {
      if (err) { throw err; }
      const [ next, keys ] = reply;
  
      cursor = next;
  
      if (cursor === '0') {
        results = results.map(parser);
        return results;
      } else {
        results = results.concat(keys);
        return _scan(parser);
      }
    });
  }

  return _scan(parser);
};

/* public api */
const insert = entry => {
    client.set(`nexjob:${entry.uid}`, JSON.stringify(entry));
};

const fetch = uid => {
  if (uid) {
    const entry = client.get(`nexjob:${entry.uid}`);
    return JSON.parse(entry);
  } else {
    return scan((result) => {
      return client.get(result);
    });
  }
};

const update = (uid, object) => {
  let entry = fetch(uid);

  entry = Object.assign(
      {}, entry, object,
      { updatedAt: now }
  );

  client.set(`nexjob:${uid}`, JSON.stringify(entry));
  return entry;
};

const remove = uid => {
  client.del(`nexjob:${uid}`);
  return true;
};

const cleanup = () => {
  return scan((result) => {
    return client.del(result);
  });
};

module.exports = {
  insert,
  fetch,
  update,
  remove,
  cleanup,
}