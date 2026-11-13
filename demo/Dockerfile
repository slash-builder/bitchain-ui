# nginx 1.31.8-alpine, pinned to the multi-arch index digest (resolved 2026-11-12).
# The tag is kept so the version stays readable; the digest is what is pulled.
FROM nginx:1.31.8-alpine@sha256:713fc2ebfd92e8217db451477182ee91944b123d2b1ee9fd5a8c6e91ca6c3a11
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
# docker build -t bitchain-ui-prototype .
# docker run -p 8080:80 bitchain-ui-prototype  →  http://localhost:8080
