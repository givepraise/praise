# praise

## 1. Run MongoDB

Prerequisites:

- Docker installed

Pull mongo image:

```
docker pull mongo
```

Run mongo:

```
yarn mongodb:start
```

## 2. Start api backend

Build:

```
yarn workspace api build
```

Start:

```
yarn workspace api start
```

## 3. Start Discord bot

Build:

```
yarn workspace bot_discord build
```

Start:

```
yarn workspace bot_discord start
```
