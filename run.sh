#!/usr/bin/env bash

chown -R nginx:nginx /ronak/app
chown -R nginx:nginx /var/lib/nginx

mv /ronak/app/nginx.conf /etc/nginx/nginx.conf

nginx -t
nginx -g "daemon off;"
