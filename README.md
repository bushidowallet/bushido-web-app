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
        root   C:/Dev/code/bushido/bushido-web-app;
        index  index.html;
    }

    location /login {
        root C:/Dev/code/bushido/bushido-web-app/modules/signin;
    }

    location /register {
        root C:/Dev/code/bushido/bushido-web-app/modules/signup;
    }

    location /help {
        root C:/Dev/code/bushido/bushido-web-app/modules/signin/help;
    }

    location /verify {
        root C:/Dev/code/bushido/bushido-web-app/modules/account/verify;
    }

    location /confirm {
        root C:/Dev/code/bushido/bushido-web-app/modules/account/verify/confirm;
    }

    location /checkout {
        root C:/Dev/code/bushido/bushido-web-app/modules/checkout;
    }

    location /docs {
        root C:/Dev/code/bushido/bushido-web-app/modules/docs;
    }

    location /export {
        root C:/Dev/code/bushido/bushido-web-app/modules/export;
    }

    location /password {
        root C:/Dev/code/bushido/bushido-web-app/modules/password;
    }

    location /pos {
        root C:/Dev/code/bushido/bushido-web-app/modules/pos;
    }

    location /settings {
        root C:/Dev/code/bushido/bushido-web-app/modules/settings;
    }

    location /setup {
        root C:/Dev/code/bushido/bushido-web-app/modules/setup;
    }

    location /transactions {
        root C:/Dev/code/bushido/bushido-web-app/modules/transactions;
    }

    location /user {
        root C:/Dev/code/bushido/bushido-web-app/modules/user;
    }

    location /wallet {
        root C:/Dev/code/bushido/bushido-web-app/modules/wallet;
    }
}
```