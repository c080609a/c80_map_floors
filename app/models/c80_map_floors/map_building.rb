module C80MapFloors
  class MapBuilding < ActiveRecord::Base
    has_many :floors, :class_name => 'C80MapFloors::Floor', :dependent => :destroy
    belongs_to :building_representator, :polymorphic => true
    validates :coords, uniqueness: true
    after_save :update_json

    mount_uploader :img, C80MapFloors::BuildingImageUploader

    def areas
      C80MapFloors::Areas.joins(:c80_map_floors_floors).where(:building_id => self.if)
    end

    private

    def update_json
      MapJson.update_json
    end

  end
end