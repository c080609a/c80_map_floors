module C80MapFloors

  #==========================================================
  #
  #   Это Площадь (которая привязывается к полигону на карте)
  #
  #==========================================================

  module AreaRepresentator

    # noinspection RubyResolve
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

      # noinspection RubyResolve
      def acts_as_map_area_representator
        class_eval do

          has_one :area, :as => :area_representator, :class_name => 'C80MapFloors::Area', :dependent => :nullify

          after_save :update_json

          # выдать название привязанного к Площади полигона
          def apolygon_title
            res = '-'
            if self.area.present?
              res = "id=#{self.area.id}"
            end
            res
          end

          def update_json
            # MapJson.update_json # NOTE-json:: возможно, временно отключён
          end

        end
      end
    end

    module InstanceMethods

=begin
# legacy от с80_map
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
=end

      # Выдать json Площади, которая привязана к полигону на карте
      # noinspection RubyResolve
      def my_as_json2
        result = {
            id:             self.id,
            title:          self.name,
            square:         self.square,
            desc:           self.desc,
            price_string:   self.price_string,
            communications: self.communications,
            is_free:        self.is_free?,
            shop:           self.shop_as_json
        }
        result.as_json
      end

    end

  end
end

ActiveRecord::Base.send :include, C80MapFloors::AreaRepresentator