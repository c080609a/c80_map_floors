module C80MapFloors

  class MapJson < ActiveRecord::Base

    # этот метод вызовается после update Area
    def self.update_json
      locations_path = Rails.root.join("public", "locations.json")
      locs = File.read(locations_path)
      # puts "<MapJson.update_json> #{ Rails.root.join("public", "locations.json") }"

      locs_hash = JSON.parse(locs)

      # обходим все Building и составляем массив вида
      # [{id, object_type=object_type, coords, building_hash, img, childs:[<areas>]},..]
      buildings_to_location_json = []
      Building.all.each do |b|
        # Rails.logger.debug "[TRACE] <MapJson.update_json> building: #{b}; building_representator: #{b.building_representator}"

        # сначала соберём детей - Area
        childs = []
        b.areas.each do |area|
          # Rails.logger.debug "[TRACE] <MapJson.update_json> [1] area #{area}; area_representator: #{area.area_representator}"

          # соберём хэш привязанной к полигону площади
          har = {}
          if area.area_representator.present?
            # Rails.logger.debug "[TRACE] <MapJson.update_json> [2] area #{area}; area_representator: #{area.area_representator}"
            har = area.area_representator.to_hash_a
            har["is_free"] = area.area_representator.is_free?
          end

          ab = {
              id: area.id,
              object_type: 'area',
              coords: area.coords.split(','),
              area_hash: har
              # area_hash: {
              #     id: 2,
              #     title: "Площадь #{area.id}.#{area.id}",
              #     is_free: true,
              #     props: {
              #         square: "124 кв.м.",
              #         floor_height: "6 кв. м",
              #         column_step: "2 м",
              #         gate_type: "распашные",
              #         communications: "Интернет, электричество, водоснабжение",
              #         price: "от 155 руб/кв.м в месяц"
              #     }
              # }
          }
          childs << ab
        end

        # соберём хэш привязанного к полигону здания
        hbu = {}
        if b.building_representator.present?
          hbu = b.building_representator.to_hash
          # har["is_free"] = area.area_representator.is_free?
        end

        cc = nil
        if b.coords.present?
          cc = b.coords.split(",")
        else
          Rails.logger.debug "[TRACE] <Map_json.update_json> nil! #{b.id}"
        end

        ob = {
            id: b.id,
            object_type: 'building',
            coords: cc,
            building_hash: hbu,
            # building_hash: {
            #     id: 2,
            #     title: "Здание 2",
            #     props: {
            #         square: "1234 кв.м.",
            #         square_free: "124 кв. м",
            #         floor_height: "6 кв. м",
            #         column_step: "2 м",
            #         gate_type: "рaспашные",
            #         communications: "Интернет, электричество, водоснабжение",
            #         price: "от 155 руб/кв.м в месяц"
            #     }
            # },
            img: {
                bg: {
                    src: b.img_bg.url
                },
                overlay: {
                    src: b.img_overlay.url
                }
            },
            childs: childs
        }
        buildings_to_location_json << ob
      end

      # просто заменяем всех детей
      locs_hash["childs"] = buildings_to_location_json

      Rails.logger.debug "<MapJson.update_json> #{locs_hash}"

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