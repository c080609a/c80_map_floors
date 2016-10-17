module C80MapFloors
  class Setting < ActiveRecord::Base
    mount_uploader :map_image, C80MapFloors::MapImageUploader
    after_save :update_json

    def map_img
      MiniMagick::Image.open(map_image.path)
    end

    protected

    def update_json

      if self.map_image.present?
        locations_path = Rails.root.join("public", "locations.json")
        locs = File.read(locations_path)
        puts "<update_json> #{ Rails.root.join("public", "locations.json") }"

        locs_hash = JSON.parse(locs)
        locs_hash["mapwidth"] = map_img["width"].to_s
        locs_hash["mapheight"] = map_img["height"].to_s
        locs_hash["img"] = map_image.url.to_s

        File.open(locations_path, 'w') do |f|
          f.write(locs_hash.to_json)
        end
      end

    end

  end
end