FROM node:22
ENV LANG=C.UTF-8
ENV TZ=Asia/Tokyo

WORKDIR /app

COPY . /app