FROM alpine

# Create app directory
RUN mkdir -p /run/nginx
RUN mkdir -p /ronak/app
WORKDIR /ronak/app
RUN apk update
RUN apk add nginx
EXPOSE 80
EXPOSE 443

COPY ./run.sh .
RUN chmod +x run.sh
CMD  /bin/sh run.sh

COPY . /ronak/app
