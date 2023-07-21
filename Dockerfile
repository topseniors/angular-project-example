FROM nginx
COPY default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
COPY ./dist /usr/share/nginx/html
