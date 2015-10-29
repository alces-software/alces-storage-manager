# Alces Storage Manager

Copyright (C) 2015 Stephen F. Norledge and Alces Software Ltd. See LICENSE.txt.


## Description

Alces Storage Manager is a web-based file manager designed to work with Alces
Polymorph cluster daemon. It provides users with a means to manage uploading,
downloading and manipulating files in their cluster storage via their web
browser.

## Configuration

App-specific configuration consists of two files stored in the `config`
directory. Sample configuration files are provided with `.ex` extensions.

### targets.yml

Specifies which directories should be made available to each user. The options
for each entry are:

* `:dir` - string specifying the directory. Mutually exclusive with 
  `:dir_spec`.
* `:dir_spec` - symbol specifying a special directory. Mutually exclusive with
  `:dir`.
  * `:home` for the user's home directory
  * `:tmpdir` for the operating system's temporary file path (as per Ruby's
    `Dir#tmpdir()`)
* `:type` - should be `:polymorph` for Polymorph directories. Could perhaps 
  be `:local` but that's probably not what you want...

For Polymorph targets, further options are:

* `:address` - the IP address and port of the Polymorph daemon to connect to. 
  Required.
* `:ssl` - set to `true` to use an SSL connection. Recommended.

### ssl.yml

Specifies SSL configuration options. Only used if there are connections with
`:ssl: true` set.

* `:root` - Path to directory containing required SSL artefacts.
* `:certificate` - Client SSL certificate, relative to `:root`.
* `:key` - Client SSL keyfile, relative to `:root`.
* `:ca` - CA certificate, relative to `:root`.
