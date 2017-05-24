# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'c80_map_floors/version'

Gem::Specification.new do |spec|
  spec.name          = "c80_map_floors"
  spec.version       = C80MapFloors::VERSION
  spec.authors       = ["C80609A"]
  spec.email         = ["c080609a@gmail.com"]

  spec.summary       = 'Map'
  spec.description   = 'Map + map editor'
  spec.homepage      = 'http://www.vorsa-park.ru'
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.9"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_dependency 'activesupport', ['>= 3.0.0']
  spec.add_dependency 'bootstrap-sass', '~> 3.3.4'
  spec.add_dependency 'bootstrap-select-rails'
  spec.add_dependency 'historyjs-rails'
  spec.add_development_dependency 'friendly_id'
  spec.add_development_dependency 'babosa'
  spec.add_development_dependency 'mysql2'
  spec.add_development_dependency 'rails'
  spec.add_development_dependency 'rspec-rails'
end
