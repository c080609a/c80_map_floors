module C80MapFloors

  #==========================================================
  #
  #   Это Здание (которое привязывается к полигону на карте)
  #
  #==========================================================

  module BuildingRepresentator

    extend ActiveSupport::Concern

    #  ERROR: Cannot define multiple 'included' blocks for a Concern
    # included do
    #
    # end

    def self.included(klass)
      klass.extend ClassMethods
      klass.send(:include, InstanceMethods)
    end

    # noinspection ALL
    module ClassMethods

      def acts_as_map_building_representator
        class_eval do

          has_one :map_building, :as => :building_representator, :class_name => 'C80MapFloors::MapBuilding', :dependent => :nullify
          after_save :update_json

          scope :order_title, -> {order(:title => :asc)}

          def self.unlinked_buildings
            res = []
            self.all.each do |building|
              unless building.map_building.present?
                res << building
              end
            end
            res
          end

          def update_json
            MapJson.update_json
          end

          # выдать название привязанного к Зданию полигона
          def bpolygon_title
            res = '-'
            if self.map_building.present?
              res = "'#{self.map_building.title}'"
            end
            res
          end

        end
      end
    end

    # noinspection ALL
    module InstanceMethods

      # выдать json Здания, которое привязано к полигону на карте
      def my_as_json6
        result = {
            id:             self.id,
            title:          self.title,
            square:         self.square,
            square_free:    self.square_free,
            desc:           self.desc,
            floor_height:   self.floor_height,
            price_string:   self.price_string,
            communications: self.communications
        }
        result.as_json
      end

=begin
      def to_hash

        Rails.logger.debug "<BuildingRepresentator.to_hash> self.free_square = #{self.free_square}"

        res = {
            id: self.id,
            title: self.title,
            props: {
                square: self.square,
                free_square: self.free_square,
                floor_height: self.floor_height,
                gate_type: self.gate_type,
                desc: self.desc,
                column_step: self.column_step,
                communications: self.communications,
                price: self.price_string,
                free_areas_count: self.free_areas_count # NOTE: free_areas_count находися в Rent::Building проекта vorsa
            }
        }
        res
      end
=end

=begin
      def serializable_hash(options = nil)
        super({
                  :except => [:created_at, :updated_at]
              })
      end
=end

    end

  end
end

ActiveRecord::Base.send :include, C80MapFloors::BuildingRepresentator