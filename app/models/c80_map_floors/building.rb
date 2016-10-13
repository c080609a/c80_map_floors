module C80MapFloors
  class Building < ActiveRecord::Base
    has_many :areas, :class_name => 'C80MapFloors::Area', :dependent => :destroy
    belongs_to :building_representator, :polymorphic => true
    validates :coords, uniqueness: true
    after_save :update_json
    mount_uploader :img_bg, C80MapFloors::BuildingImageUploader
    mount_uploader :img_overlay, C80MapFloors::BuildingImageUploader

    private

    def update_json
      MapJson.update_json
    end

  end
end