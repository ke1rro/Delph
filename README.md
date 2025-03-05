# Documentation

## Backend

> [!CAUTION]
> Install requirements to work with repo

> [!IMPORTANT]
> To work with repository create new branch from `dev` and submit pull request

1. Link[https://www.pgadmin.org/download/] - download and install pgAdmin4

2. Rename `.env_example(rename -this-to-.env)` -> `.env`

3. Download docker

4. Setup Docker Desktop [optional]

5. Start docker deamon

6. Run command below

```bash
docker-compose up -d --build
```

### Generate Private and Public key

```bash
cd certificates
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -outform PEM -pubout -out jwt-public.pem
```

----

## Frontend

### **Routers**

- `login` - `http://localhost:3000/`
- `map` - `http://localhost:3000/map`

### To run

#### locally

```bash
cd frontend
npm install
npm run dev
```
