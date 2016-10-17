module C80MapFloors
  class Floor < ActiveRecord::Base

    belongs_to :map_building
    has_many :areas, :class_name => 'C80MapFloors::Area', :dependent => :destroy

    validates :coords, uniqueness: true
    after_save :update_json

    mount_uploader :img_bg, C80MapFloors::FloorImageUploader
    mount_uploader :img_overlay, C80MapFloors::FloorImageUploader

    private

    def update_json
      MapJson.update_json
    end

  end
end