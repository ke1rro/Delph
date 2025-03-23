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

----

## **Routers**

🔹 Frontend: http://localhost:3000

🔹 signup: http://localhost:3000/signup

🔹 login: http://localhost:3000/login

🔹 map: http://localhost:3000/map

🔹 FastAPI: http://localhost:8000/docs

🔹 Hello world test (via NGINX): http://localhost:8080/greet

🔹 FastAPI (via NGINX): http://localhost:8080/api

### To run Frontend

#### locally

```bash
cd frontend
npm install
npm run dev
```
