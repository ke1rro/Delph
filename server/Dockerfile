FROM python:3.12-slim AS jwks-builder

WORKDIR /builder

COPY /server/requirements.txt .

RUN pip install --upgrade setuptools
RUN pip install --no-cache-dir -r requirements.txt

RUN chmod 755 .

COPY /certificates/. ./certificates/.
COPY /server/generate_jwks.py .

RUN python generate_jwks.py main < certificates/jwt-public.pem > jwks.json

FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf
COPY /server/nginx.conf /etc/nginx/nginx.conf
COPY --from=jwks-builder /builder/jwks.json /etc/ssl/jwks.json

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
