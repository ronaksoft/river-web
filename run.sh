#!/usr/bin/env bash

chown -R nginx:nginx /ronak/nested/webapp
chown -R nginx:nginx /var/lib/nginx

echo "Starting Web Servers "
node /bin/dns-discovery.js &

cd /ronak/nested/webapp
echo "Directory changed to (`pwd`)"
node /bin/nested-reconfig.js script=scripts tmp=nestedConfig
node /bin/nested-reconfig.js script=m/js tmp=nestedConfigMobile
node /bin/nested-reconfig.js script=admin tmp=nestedConfigAdmin
node /bin/nested-reconfig.js script=t tmp=nestedConfigT
node /bin/nested-reconfig.js script=oauth tmp=nestedConfigOauth
sleep 1
cd /bin

export DOLLAR='$';

if [ -n "${NST_ADDR_PORT}" ]; then
    echo "";
else
    export NST_ADDR_PORT=80;
fi
if  [[ -n "${NST_TLS_KEY_FILE}" && -n "${NST_TLS_CERT_FILE}" ]] ; then
     if  [[ -f $NST_TLS_CERT_FILE && -f $NST_TLS_KEY_FILE ]]; then
        echo "Webapp started over SSL" ;
        envsubst < nginx-ssl.conf.template > /etc/nginx/nginx.conf;
     else
        echo "Webapp started without SSL" ;
        envsubst < nginx.conf.template > /etc/nginx/nginx.conf;
     fi ;
else
     echo "Webapp started without SSL" ;
     envsubst < nginx.conf.template > /etc/nginx/nginx.conf;
fi

nginx -t
nginx -g "daemon off;"
