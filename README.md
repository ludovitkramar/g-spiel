# Running the server

It is designed to run behind a proxy and the client will try to connect to 
```
http://example.com/gSpiel/
```

## Apache demo config

### Modules 

- LoadModule rewrite_module modules/mod_rewrite.so
- LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
- LoadModule proxy_http_module modules/mod_proxy_http.so

### Configuration
```
RewriteEngine On

RewriteCond %{REQUEST_URI}  ^/gSpiel/socket.io            [NC]
RewriteCond %{QUERY_STRING} transport=websocket    [NC]
RewriteRule /gSpiel/(.*)           ws://127.0.0.1:8282/$1 [P,L]

ProxyPass /gSpiel http://127.0.0.1:8282
ProxyPassReverse /gSpiel http://127.0.0.1:8282
ProxyPass        /gSpiel/socket.io  http://127.0.0.1:8282/socket.io
ProxyPassReverse /gSpiel/socket.io  http://127.0.0.1:8282/socket.io
```