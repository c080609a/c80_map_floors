require 'c80_map_floors/base_map_object'

module C80MapFloors
  class Area < ActiveRecord::Base

    belongs_to :floor
    belongs_to :area_representator, :polymorphic => true
    acts_as_base_map_object

    def my_as_json4

      result = {
          id:         self.id,
          tag:        self.tag,
          floor_id:   self.floor_id,
          class_name: self.class_name,
          coords:     self.coords,
          data:       nil
      }

      if self.area_representator.present?
        result[:data] = self.area_representator.my_as_json2
      end

      result.as_json
    end

  end
end