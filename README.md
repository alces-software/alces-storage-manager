# Alces Storage Manager
Copyright (C) 2015 Stephen F. Norledge and Alces Software Ltd. See LICENSE.txt.


## Description
Alces Storage Manager is a web-based file manager designed to serve filesystems
via the Alces Storage Manager Daemon. It provides users with a means to manage
uploading, downloading and manipulating files in their cluster storage via
their web browser.

## Configuration
Alces Storage Manager is a Ruby on Rails application. You must have Ruby 
installed before installing Alces Storage Manager.

1. Clone the git repository:

   ```$ git clone git@github.com:alces-software/alces-storage-manager.git```

2. From your repository, install Ruby dependencies with bundler:

   ```$ ./bin/bundle install```

3. Ensure Alces Storage Manager Daemon is configured and running on the node(s)
   with access to the storage.

4. Configure the Storage Manager by editing the `config/storagemanager.yml`
directory. A sample configuration file is provided at 
`config/storagemanager.yml.ex`. The two sections of this file are as follows:

   ### :auth
   Specifies options for connecting to the ASM daemon used for authentication.
   * `:address` - the IP address and port of the ASM daemon to connect to. This
   should be the (or one of the) ASMD(s) configured in step 3. Required.
   * `:ssl` - set to `true` to use an SSL connection. Recommended.

   ### :ssl

   Specifies SSL configuration options. Only used if there are remote
   connections with `:ssl: true` set.

   * `:root` - Path to directory containing required SSL artefacts.
   * `:certificate` - Client SSL certificate, relative to `:root`.
   * `:key` - Client SSL keyfile, relative to `:root`.
   * `:ca` - CA certificate, relative to `:root`.

5. Start Alces Storage Manager by running 

   ```$ ./bin/rails server```
   
   By default, the server will run in development mode and listen to localhost
   on port 3000. Other options are available and can be seen with the `-h` 
   switch, e.g.
   
   ```$ ./bin/rails server -h```
   
   For example, to start the Storage Manager in production mode, listening on
   all interfaces on port 8080, run:
   
   ```$ ./bin/rails server -e production -b * -p 8080```
   
   For production environments it may be more suitable to run ASM under nginx
   or Apache. You will also need to specify a secret key for the server in 
   production mode.
 
 ## Usage
 1. Load the Storage Manager in your web browser. If running as in the above
 example, this may be at http://storagemanagerhost:8080.
 2. Log in using your cluster username and password.