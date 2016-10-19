require 'c80_map_floors/base_map_object'

module C80MapFloors
  class Floor < ActiveRecord::Base

    belongs_to :map_building
    has_many :areas, :class_name => 'C80MapFloors::Area', :dependent => :destroy
    acts_as_base_map_object

    # validates :coords, uniqueness: true
    # after_save :update_json

    mount_uploader :img_bg, C80MapFloors::FloorImageUploader
    mount_uploader :img_overlay, C80MapFloors::FloorImageUploader

    def as_json(options = nil)
      super({:include => :areas}.merge(options || {} ))
    end

    # private

    # def update_json
    #   MapJson.update_json
    # end

  end
end