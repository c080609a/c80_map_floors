require 'c80_map_floors/base_map_object'

module C80MapFloors
  class Area < ActiveRecord::Base

    belongs_to :floor
    belongs_to :area_representator, :polymorphic => true
    acts_as_base_map_object


  end
end