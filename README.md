# Alces Storage Manager
Copyright (C) 2015 Stephen F. Norledge and Alces Software Ltd. See LICENSE.txt.


## Description
Alces Storage Manager is a web-based file manager designed to serve filesystems
via the Alces Storage Manager Daemon or Amazon's S3 service (or compatible). It
provides users with a means to manage uploading, downloading and manipulating
files in their cluster storage via their web browser.

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

   ### :downloadSizeLimit
   Limits the maximum size (in MB) of files able to be downloaded or previewed
   from S3 volumes. Currently files on S3 volumes must be proxied with a 
   temporary file on the ASM host before they can be downloaded by users. This
   setting prevents users from downloading files too large, which may
   potentially cause disk space issues. Default value is 50MB.

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

## Defining storage targets
 
 There are two ways of defining storage 'targets' - that is, storage volumes
 that appear in the file manager - system-wide and user-specifically.
 
### Defining system-wide targets
 
 The ASM Daemon looks in the `/etc/xdg/clusterware/storage/` directory for
 configuration files that apply to all users. Users will keep their user
 privileges so you will still need to ensure that they have suitable
 permissions on the relevant filesystem(s).
 
 Changes to system-wide targets require a restart of the ASM application.
 
### Defining user-specific targets
 
 Users may create target configuration files in their 
 `~/.config/clusterware/storage/` directories (on the system running the ASM
 daemon). Changes to these files take effect without needing a restart; users
 may have to refresh the page in their browser.
 
### Target file format
 
 The target specification files are YAML and each describe a single storage
 volume. They should be called `<name>.target.yml`.
 
 Example:
 
 ```
 ---
name: "Home"
type: posix
dir: "%#{dir}/"
address: "127.0.0.2:25268"
```

#### Options common to all types

* `name` - **Required**. Unique identifying string for this target.
* `type` - **Required**. Type of connection. Must be one of `posix` or `s3`.
* `address` - for `posix` targets, the IP address and port of the running ASM
daemon providing this volume, and defaults to the daemon configured for
authentication. For `s3` targets, the address of the S3-compatible gateway;
defaults to Amazon's AWS S3 service.
* `sortKey` - when present, this will be used instead of `name` to determine
the ordering of the target. Targets are sorted alphabetically, and system
targets are always displayed before user targets.

#### Options specific to 'posix' targets

* `dir` - **Required**. Directory that is the root of this target. May either be a literal
path such as `/opt/somefolder/` or use a Ruby-style hash string replacement
to include variables such as the user's name, home directory or the system temp
directory; for example `%#{dir}/` for their home directory, or 
`%/scratch/#{name}/` to represent a user's named directory under `/scratch`.
* `ssl` - Boolean flag for whether or not to use an SSL connection. Defaults to
true.

#### Options specific to 's3' targets

* `access_key` - **Required**. The access key from the AWS credentials to be used.
* `secret_key` - **Required**. The secret key from the AWS credentials to be used.
* `buckets` - List of additional public buckets to include in the volume. For
example, `['1000genomes']` will include read-only access to the 1000 Genomes
project bucket, one of several data sets made available by Amazon. See 
https://aws.amazon.com/datasets/ for more details.

#### Errors in targets

Any errors in target configuration files are reported to the ASM log, and will
also be shown to the user in an error box at the top of the page. Invalid
targets are skipped and will not appear in the file browser interface.
