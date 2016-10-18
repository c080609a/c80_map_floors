require 'c80_map_floors/base_map_object'

module C80MapFloors
  class Area < ActiveRecord::Base

    belongs_to :floor
    belongs_to :area_representator, :polymorphic => true
    # validates :coords, uniqueness: true
    acts_as_base_map_object

    # after_save :update_json

    # protected

    # def update_json
    #   MapJson.update_json
    # end

  end
end