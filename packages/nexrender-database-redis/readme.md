# Database: Redis

Redis database provider for `@nexrender/server`.

## Installation

```
npm i @nexrender/database-redis -g
```

## Configuration

In order to use this, `NEXRENDER_DATABASE_PROVIDER` needs to be set to `redis`.
Also you can define the number of keys to retrieve in a single iteration during the `SCAN` operation using  `SCAN_CHUNK_SIZE`. Default is `10`.

```
export NEXRENDER_DATABASE_PROVIDER="redis"
export REDIS_URL="redis://localhost:6379"
export SCAN_CHUNK_SIZE="100"
```
