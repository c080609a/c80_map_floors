module C80MapFloors

  class MapJson < ActiveRecord::Base

    def self.update_json

      # открываем файл на чтение
      locations_path = Rails.root.join("public", "locations.json")
      locs = File.read(locations_path)
      locs_hash = JSON.parse(locs)

      # поместим в него детей - здания со всеми детьми и внуками
      buildings = []
      C80MapFloors::MapBuilding.all.each do |building|
        buildings << building.as_json
      end

      locs_hash["buildings"] = buildings

      # запишем в файл
      File.open(locations_path, 'w') do |f|
        f.write(locs_hash.to_json)
      end

    end

    def self.fetch_json
      locations_path = Rails.root.join("public", "locations.json")
      locs = File.read(locations_path)
      JSON.parse(locs)
    end

  end

end