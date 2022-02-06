# praise

## 1. Install dependencies

```
yarn
```

## 2. Run MongoDB

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

## 3. Start api backend

Build:

```
yarn workspace api build
```

Start:

```
yarn workspace api start
```

## 4. Start Discord bot

Build:

```
yarn workspace bot_discord build
```

Start:

```
yarn workspace bot_discord start
```

## 5. Start frontend

Build:

```
yarn workspace frontend build
```

Start:

```
yarn workspace frontend start
```
