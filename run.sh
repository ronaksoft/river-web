#!/usr/bin/env bash

chown -R nginx:nginx /ronak/app
chown -R nginx:nginx /var/lib/nginx

export DOLLAR='$';
echo "API URL: ${NST_API_URL}"
echo "FILE_URL: ${NST_FILE_URL}"
if  [[ -n "${NST_TLS_KEY_FILE}" && -n "${NST_TLS_CERT_FILE}" ]] ; then
     if  [[ -f $NST_TLS_CERT_FILE && -f $NST_TLS_KEY_FILE ]]; then
        echo "Started over SSL" ;
        envsubst < /ronak/app/nginx-ssl.conf.template > /etc/nginx/nginx.conf;
     else
        echo "Started without SSL" ;
        envsubst < /ronak/app/nginx.conf.template > /etc/nginx/nginx.conf;
     fi ;
else
     echo "Webapp started without SSL" ;
     envsubst < /ronak/app/nginx.conf.template > /etc/nginx/nginx.conf;
fi

nginx -t
nginx -g "daemon off;"
