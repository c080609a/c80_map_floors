require 'c80_map_floors/base_map_object'
require 'integer'

module C80MapFloors
  class MapBuilding < ActiveRecord::Base

    has_many :floors, :class_name => 'C80MapFloors::Floor', :dependent => :destroy
    belongs_to :building_representator, :polymorphic => true
    # validates :coords, uniqueness: true
    # after_save :update_json

    after_create :calc_coords_img

    acts_as_base_map_object

    mount_uploader :img, C80MapFloors::BuildingImageUploader

    def areas
      C80MapFloors::Areas.joins(:c80_map_floors_floors).where(:building_id => self.if)
    end

    def as_json(options = nil)

      super({
                :except => [:created_at,:updated_at,:building_representator_type, :building_representator_id],
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

    def calc_coords_img

      cs = self.coords.split(',') # 511,71,511,71,497,88,497,110,865,196,865,172,876,155

      #-> Рассчитаем весь bounding box, но вернём только верхний левый угол

      xmin = Integer::MAX.to_f
      ymin = Integer::MAX.to_f
      xmax = Integer::MIN.to_f
      ymax = Integer::MIN.to_f

      (0..cs.count-1).step(2) do |i|

        ix = cs[i].to_f
        iy = cs[i+1].to_f

        # Rails.logger.debug "[TRACE] <map_building.calc> #{ix}, #{iy}"

        xmin = ix < xmin ? ix : xmin
        ymin = iy < ymin ? iy : ymin

        xmax = ix > xmax ? ix : xmax
        ymax = iy > ymax ? iy : ymax

      end

      # bbox = {
      #     xmin: xmin,
      #     ymin: ymin,
      #     xmax: xmax,
      #     ymax: ymax
      # }

      str = [
          '%.01f' % xmin,
          '%.01f' % ymin
      ].join(',')

      self.update_column(:coords_img, str)

    end

    # private

    # def update_json
    #   MapJson.update_json
    # end

  end
end