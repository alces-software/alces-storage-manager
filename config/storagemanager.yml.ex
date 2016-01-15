--- 
:auth:
  # The ASM daemon used for authentication.
  :address: "127.0.0.1:25268"
  :ssl: true
:ssl:
  # Options used for SSL connections
  :root: /home/james/ssl/client/
  :certificate: daemon-client_crt.pem
  :key: daemon-client_key.pem
  :verify: true
  :ca: alces-ca_crt.pem
