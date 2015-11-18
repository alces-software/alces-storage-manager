--- 
:auth:
  # The ASM daemon used for authentication.
  :address: "127.0.0.1:25268"
  :ssl: true
:targets:
  # The list of directories presented to the user.
  Home: 
    :type: :remote
    :dir_spec: :home
    :address: "127.0.0.1:25268"
    :ssl: true
  Root:
    :type: :remote
    :dir:   "/"
    :address: "127.0.0.1:25268"
    :ssl: true
:ssl:
  # Options used for SSL connections
  :root: /home/james/ssl/client/
  :certificate: daemon-client_crt.pem
  :key: daemon-client_key.pem
  :ca: alces-ca_crt.pem