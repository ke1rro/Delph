FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf
COPY /server/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
