module C80MapFloors

  module FloorRepresentator

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

      def acts_as_map_floor_representator
        class_eval do

          has_one :floor, :as => :map_floor_representator, :class_name => 'C80MapFloors::Floor', :dependent => :nullify

          # after_save :update_json # NOTE:: возможно, временно

          # выдать список несвязанных с полигонами Этажей (указанного здания building_id)
          # def self.unlinked_floors(building_id) # building_id - не используется, надо дописать код, чтобы использовался
          #   res = []
          #   self.all.each do |sfloor|
          #     unless sfloor.floor.present?
          #       res << sfloor
          #     end
          #   end
          #   Rails.logger.debug "[TRACE] <floor_representator.unlinked_floors> Кол-во несвязанных Этажей: #{res.count}."
          #   res
          # end

          def update_json
            MapJson.update_json
          end

          # выдать название привязанного к Этажу полигона (но у Этажа вместо полигона выступает картинка)
          def fpolygon_title
            res = '-'
            if self.floor.present?
              res = "'#{self.floor.title}'"
            end
            res
          end

        end
      end
    end

    module InstanceMethods

      # noinspection RubyResolve
      def my_as_json3
        result = {
            id:               self.id,
            ord:              self.ord,
            title:            self.title,
            square:           self.square,
            square_free:      self.square_free,
            areas_count:      self.areas.count,
            areas_free_count: self.areas.free_areas.count,
            price_string:     self.price_string,
            floor_height:     self.floor_height,
            communications:   self.communications
        }
        result.as_json
      end

    end

  end
end

ActiveRecord::Base.send :include, C80MapFloors::FloorRepresentator