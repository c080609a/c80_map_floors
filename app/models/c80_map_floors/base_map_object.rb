module C80MapFloors
  module BaseMapObject

    extend ActiveSupport::Concern

    def self.included(klass)
      klass.extend ClassMethods
      klass.send(:include, InstanceMethods)
    end

    module ClassMethods

      def acts_as_base_map_object
        class_eval do

          # has_many :map_buildings, :as => :building_representator, :class_name => 'C80MapFloors::MapBuilding', :dependent => :destroy
          after_save :update_json
          # after_destroy :update_json
          validates :coords, uniqueness: true

          def update_json
            MapJson.update_json
          end

        end
      end
    end

    module InstanceMethods

      # используется для сопоставления js классов
      def class_name
        self.class.name
      end

    end

  end
end

ActiveRecord::Base.send :include, C80MapFloors::BaseMapObject