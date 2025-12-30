# Deployment / DNS / Reverse Proxy Notes

This project serves both a frontend (client) and a backend API (server). If you want `admin.parnanzonehomes.com` to work with the API and avoid CORS errors, ensure requests to `/api/*` reach the Node server (not a static host returning HTML 404). The quickest reliable solutions are:

## Option A — Point the API subdomain to the Node server

1. Ensure the DNS A record for `admin.parnanzonehomes.com` points to the server IP running Node (or to a load balancer that forwards to Node).
2. Run your Node process on that host and ensure a firewall allows the port (HTTP/HTTPS via port 80/443).
3. Set `CORS_ORIGIN` in the server env to include the frontend domain(s) exactly (including `https://`).

## Option B — Use a reverse proxy (recommended when serving frontend & backend from same host)

If your hosting provider uses LiteSpeed/Apache for static sites, you can configure a reverse proxy to forward `/api` to the Node process on the same server or a backend host.

### Example nginx config (proxy `/api` to the Node process on this host, port 5000)

```
server {
  listen 80;
  server_name admin.parnanzonehomes.com;

  location /api/ {
    proxy_pass http://127.0.0.1:5000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    # serve static admin site or return 404
    try_files $uri $uri/ =404;
  }
}
```

If using HTTPS, configure the `listen 443 ssl;` block and certificates (Let's Encrypt certbot or your provider).

### Example Apache / LiteSpeed proxy snippet

In Apache vhost config (or .htaccess if permitted):

```
ProxyPreserveHost On
ProxyRequests Off
ProxyPass /api/ http://127.0.0.1:5000/api/
ProxyPassReverse /api/ http://127.0.0.1:5000/api/
```

Note: some shared hosts do not allow proxying — in that case deploy the Node API to a host that supports Node or use a platform like Render, Vercel (serverless functions), or DigitalOcean App Platform.

## After routing is correct

1. Confirm Node receives requests:
   - Hit `https://admin.parnanzonehomes.com/health` and expect JSON `{ ok: true }`.
2. Confirm CORS headers on preflight:
   - From a remote machine, run:
     ```bash
     curl -i -X OPTIONS "https://admin.parnanzonehomes.com/api/admin/login" -H "Origin: https://parnanzonehomes.com" -H "Access-Control-Request-Method: POST"
     ```
   - Response should include `Access-Control-Allow-Origin: https://parnanzonehomes.com` (or the origin) and `Access-Control-Allow-Credentials: true` if credentials enabled.

## Client configuration

- Set `VITE_API_URL` to the API base URL used by the frontend (e.g., `https://admin.parnanzonehomes.com` or `https://api.yourdomain.com`).

## Security

- Use unique `JWT_SECRET` per deployment.
- Use HTTPS for public domains.

If you want, I can:
- Provide a small `nginx` config file placed in repo under `deploy/`.
- Patch the server to add more detailed origin rejection logs.
- Help you pick a hosting provider and prepare a deployment plan.
