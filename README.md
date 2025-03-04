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

6.
   ```bash
    docker-compose up -d --build
   ````

----

## Frontend


## **Routers**

- `login` - `http://localhost:3000/`
- `map` - `http://localhost:3000/map`

### To run

#### locally

```bash
cd frontend
npm install
npm run dev
```