FROM redis:latest

RUN mkdir -p /usr/local/etc/redis

COPY redis.conf /tmp/_redis.conf
RUN cat /tmp/_redis.conf >> /usr/local/etc/redis/redis.conf
RUN rm /tmp/_redis.conf
