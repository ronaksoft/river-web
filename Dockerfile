FROM node:8.2.1-alpine

# Create app directory
RUN mkdir -p /ronak/nested
WORKDIR /ronak/nested
RUN apk update
RUN apk add gettext
RUN apk add nginx
RUN npm install -g local-web-server
EXPOSE 80
EXPOSE 443

COPY ./bin/nested-reconfig.js /bin/nested-reconfig.js
COPY ./bin/dns-discovery.js /bin/dns-discovery.js
COPY ./bin/nginx.conf.template /bin/nginx.conf.template
COPY ./bin/nginx-ssl.conf.template /bin/nginx-ssl.conf.template
COPY ./run.sh .
RUN chmod +x run.sh
CMD  /bin/sh run.sh

# Install app dependencies
COPY ./build/webapp /ronak/nested/webapp
