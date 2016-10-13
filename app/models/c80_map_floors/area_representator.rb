module C80MapFloors

  module AreaRepresentator

    extend ActiveSupport::Concern

    #  ERROR: Cannot define multiple 'included' blocks for a Concern
    # included do
    #
    # end

    def self.included(klass)
      klass.extend ClassMethods
      klass.send(:include, InstanceMethods)
    end

    module ClassMethods

      def acts_as_map_area_representator
        class_eval do

          has_many :map_areas, :as => :area_representator, :class_name => 'C80MapFloors::Area', :dependent => :destroy
          after_save :update_json

          def self.unlinked_areas
            res = []
            self.all.each do |area|
              if area.map_areas.count == 0
                res << area
              end
            end
            res
          end

          def update_json
            MapJson.update_json
          end

        end
      end
    end

    module InstanceMethods

      def to_hash_a
        res = {
            id: id,
            title: title,
            props: {
                square: square,
                floor_height: floor_height,
                gate_type: gate_type,
                desc: desc,
                column_step: column_step,
                communications: communications,
                price: price_string
            }
        }
        res
      end

      # свободна ли площадь, привязанная к полигону на карте
      def is_free?
        res = true
        if map_areas.count > 0
          res = map_areas.first.is_free?
        end
        res
      end
    end

  end
end

ActiveRecord::Base.send :include, C80MapFloors::AreaRepresentator