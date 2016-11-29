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

          # NOTE:: возможно, временно
          # after_save :update_json

          # TODO:: оставить в этом файле только InstanceMethods с class_name

          # TODO?
          # after_destroy :update_json

          # validates :coords, uniqueness: true
          validates_uniqueness_of :coords, :allow_nil => true, :allow_blank => true #-> глючит для Этажей - у них могут быть одинаковые coords

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