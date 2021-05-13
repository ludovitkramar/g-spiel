# Running the server behind a proxy

To use an address like the one below, some modifications are necessary.
```
http://example.com/gSpiel/
```

## Modifications

### /public/index.html

- Change the source of /css/style.css
- Change the source of /socket.io/socket.io.js
- Change the source of /js/script.js

### /public/js/script.js

Change the first line to

```js
let socket = io.connect("/", { path: "/EXAMPLE/socket.io" });
```

### /index.js

Change the line below to match with the port you want to use for the proxy.

```js
const PORT = process.env.PORT || 3000;
```

## Proxy with apache

### Modules 

- LoadModule rewrite_module modules/mod_rewrite.so
- LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
- LoadModule proxy_http_module modules/mod_proxy_http.so

### Configuration
```apache
RewriteEngine On

RewriteCond %{REQUEST_URI}  ^/gSpiel/socket.io            [NC]
RewriteCond %{QUERY_STRING} transport=websocket    [NC]
RewriteRule /gSpiel/(.*)           ws://127.0.0.1:8282/$1 [P,L]

ProxyPass /gSpiel http://127.0.0.1:8282
ProxyPassReverse /gSpiel http://127.0.0.1:8282
ProxyPass        /gSpiel/socket.io  http://127.0.0.1:8282/socket.io
ProxyPassReverse /gSpiel/socket.io  http://127.0.0.1:8282/socket.io
```
