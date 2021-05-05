const redis = require('redis');

const client = redis.createClient(/* TODO */);

const insert = entry => {
    client.set(`nexjob:${entry.uid}`, JSON.stringify(entry));
};

const fetch = uid => {
  if (uid) {
    const entry = client.get(`nexjob:${entry.uid}`);
    return JSON.parse(entry);
  } else {
    let cursor = '0';
    let results = [];

    const scan = () => {
      return client.scan(cursor, 'MATCH', 'nexjob:*', 'COUNT', '10', (err, reply) => {
        if (err) { throw err; }
        const [ next, keys ] = reply;
    
        cursor = next;
    
        if (cursor === '0') {
          // TODO: Get values
          return results;
        } else {
          results = results.concat(keys);
          return scan();
        }
      });
    }

    return scan();
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
  // TODO: Delete many
};

module.exports = {
  insert,
  fetch,
  update,
  remove,
  cleanup,
}