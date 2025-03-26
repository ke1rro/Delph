# Backend

> [!CAUTION]
> Install requirements to work with repo
> [!IMPORTANT]
> To work with repository create new branch from `dev` and submit pull request

1. Link[https://www.pgadmin.org/download/] - download and install pgAdmin4

2. Rename `.env_example(rename -this-to-.env)` -> `.env`

3. Download docker

4. Setup Docker Desktop [optional]

5. Start docker deamon

6.

```bash
docker-compose up -d --build
```

## Generating jwt keys

```bash
mkdir certificates
cd certificates
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -outform PEM -pubout -out jwt-public.pem
```

## Postman collection to test the API

Join the POSTMAN team

[**Team link**](https://delta6-6194.postman.co/workspace/delta~f62492cc-cf71-4441-a2ed-67e752ea4e28/collection/42375143-392cd135-bd82-4b46-b440-b434f0ccc6e2?action=share&creator=42375143)

----

## Composes

There are two available compose files.
If you want to run service without development tools like kafka ui or redis insight, then just use `docker compose up --build`, otherwise you will have to specify two compose files:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Usage
To access the system go to http://localhost:8000/
All api routes are available at http://localhost:8000/api/

## Raw access

- Frontend Service: http://localhost:8001
  - signup: http://localhost:3000/signup
  - login: http://localhost:3000/login
  - map: http://localhost:3000/map [AUTH required]
- Core Service: http://localhost:8002
  - docs: http://localhost:8002/docs
- Bridge Service: http://localhost:8003
  - docs: http://localhost:8003/docs
  - streaming endpoint: http://localhost:8003/api/bridge/messages

### To run Frontend

#### locally

```bash
cd frontend
npm install
npm run dev
```
