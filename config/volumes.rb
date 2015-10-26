#==============================================================================
# Copyright (C) 2013-2014 Stephen F Norledge & Alces Software Ltd.
#
# This file is part of Alces Valet.
#
# All rights reserved, see LICENSE.txt.
#==============================================================================

ElfinderRailsConnector::Configuration.configure do |config|
  config.volume(Arriba::Volume::Directory.new("/", "Root"))
end
