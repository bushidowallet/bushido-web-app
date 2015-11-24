# bushido-web-app
Bushido Web Wallet Application

# required nginx server settings

```
server {
    listen       80;
    server_name  localhost;

    if ( $request_filename ~ /index.html ) {
        rewrite ^ http://localhost/login.html permanent;
    }

    location / {
        root   html/app/bushido-web-app;
        index  index.html;
    }

    location /login {
        root html/app/modules/signin;
    }

    location /register {
        root html/app/modules/signup;
    }

    location /help {
        root html/app/modules/signin/help;
    }

    location /verify {
        root html/app/modules/account/verify;
    }

    location /confirm {
        root html/app/modules/account/verify/confirm;
    }

    location /checkout {
        root html/app/modules/checkout;
    }

    location /docs {
        root html/app/modules/docs;
    }

    location /export {
        root html/app/modules/export;
    }

    location /password {
        root html/app/modules/password;
    }

    location /pos {
        root html/app/modules/pos;
    }

    location /settings {
        root html/app/modules/settings;
    }

    location /setup {
        root html/app/modules/setup;
    }

    location /transactions {
        root html/app/modules/transactions;
    }

    location /user {
        root html/app/modules/user;
    }

    location /wallet {
        root html/app/modules/wallet;
    }
}
```