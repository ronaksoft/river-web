FROM node:14 as builder

COPY . /ronak/src/app
WORKDIR /ronak/src/app
RUN yarn
RUN yarn run build

COPY ./nginx.conf.template /ronak/src/app/build/nginx.conf.template
COPY ./nginx-ssl.conf.template /ronak/src/app/build/nginx-ssl.conf.template



FROM alpine

WORKDIR /ronak/app
COPY --from=builder /ronak/src/app/build /ronak/app
COPY ./run.sh /ronak/app/run.sh
RUN chmod +x /ronak/app/run.sh

RUN mkdir -p /run/nginx
RUN apk update
RUN apk add gettext
RUN apk add nginx
EXPOSE 80
EXPOSE 443

CMD  /bin/sh run.sh
