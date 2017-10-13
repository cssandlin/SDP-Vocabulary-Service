require 'ext/hessian'
require 'ext/hash'
require 'uri'

VADS_SERVICE = Hessian::HessianClient.new(Settings.vads_uri, Settings.proxy ? Settings.proxy.to_hash : {})
