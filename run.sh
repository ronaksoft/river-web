#!/usr/bin/env bash
node manifest-aid.js
chown -R nginx:nginx /ronak/app
chown -R nginx:nginx /var/lib/nginx

export DOLLAR='$';

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
