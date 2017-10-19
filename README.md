# dvb-browser

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


docker
------

```bash
# build using docker
docker run \
    --rm \
    -it \
    -v $(pwd):/data \
    -u $(id -u):$(id -g) \
    -w /data \
    -e HOME=/data \
    node:alpine \
    /bin/sh -c 'npm install && npm run build'

# run dev server using docker
docker run \
    --rm \
    -it \
    -v $(pwd):/data \
    -u $(id -u):$(id -g) \
    -w /data \
    -e HOME=/data \
    -p 8008:8008 \
    --name webpack-dev \
    node:alpine \
    /bin/sh -c 'npm install && npm run dev'
```


credits
-------

The part that communicates with DVB/VVO API is taken from [@kiliankoe](https://github.com/kiliankoe)'s
repositories [dvbjs](https://github.com/kiliankoe/dvbjs) and [vvo](https://github.com/kiliankoe/vvo)
and made suitable for a single page application in your browser.
