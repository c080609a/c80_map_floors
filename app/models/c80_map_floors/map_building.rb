require 'c80_map_floors/base_map_object'

module C80MapFloors
  class MapBuilding < ActiveRecord::Base

    has_many :floors, :class_name => 'C80MapFloors::Floor', :dependent => :destroy
    belongs_to :building_representator, :polymorphic => true
    # validates :coords, uniqueness: true
    # after_save :update_json
    acts_as_base_map_object

    mount_uploader :img, C80MapFloors::BuildingImageUploader

    def areas
      C80MapFloors::Areas.joins(:c80_map_floors_floors).where(:building_id => self.if)
    end

    def as_json(options = nil)

      super({
                :except => [:created_at,:updated_at,:building_representator_type],
                :methods => :class_name,
                :include => [
                    :floors => {
                        :except => [:created_at,:updated_at],
                        :methods => [:class_name, :img_bg_width, :img_bg_height],
                        :include => [
                            :areas => {
                                :except => [:created_at,:updated_at,:area_representator_type],
                                :methods => :class_name
                            }
                        ]
                    }
                ]
            }.merge(options || {} ))
    end

    # private

    # def update_json
    #   MapJson.update_json
    # end

  end
end