module C80MapFloors
  class Area < ActiveRecord::Base

    belongs_to :floor
    belongs_to :area_representator, :polymorphic => true
    validates :coords, uniqueness: true
    after_save :update_json

    protected

    def update_json
      MapJson.update_json
    end

  end
end