module C80MapFloors

  class MapJson < ActiveRecord::Base

    # этот метод вызовается после update Area
    def self.update_json____________old_not_working
      locations_path = Rails.root.join("public", "locations.json")
      locs = File.read(locations_path)
      # puts "<MapJson.update_json> #{ Rails.root.join("public", "locations.json") }"

      locs_hash = JSON.parse(locs)

      # обходим все Building и составляем массив вида
      # [{id, object_type=object_type, coords, rent_building_hash, img, childs:[<areas>]},..]
      buildings_to_location_json = []
      C80MapFloors::MapBuilding.all.each do |b|
        # Rails.logger.debug "[TRACE] <MapJson.update_json> building: #{b}; building_representator: #{b.building_representator}"

        # соберём детей - этажи
        childs = []

        b.floors.all.each do |floor|
          # {
          #     "map_building_id": 4,
          #     "id": 1,
          #     "coords": "",
          #     "title": null,
          # "tag": null,
          # "ord": 10,
          #     "img_bg": {
          #     "url": "/uploads/map/floors/floor_8be1.gif",
          #     "thumb": {"url": "/uploads/map/floors/thumb_floor_8be1.gif"}
          # },
          #     "img_overlay": {
          #     "url": null,
          # "thumb": {"url": null}
          # },
          #     "created_at": "2016-10-18T03:17:00.000Z",
          #     "updated_at": "2016-10-18T03:17:00.000Z"
          # }
          floor_hash = {
              id: floor.id,
              object_type: "floor",
              coords: floor.coords.split(','),
              # rent_floor_hash: har, # если у этажа появится некий набор свойств - надо будет завести модель Rent::Floor и обзавестись методом acts_like_floor
              childs: [] # соберём детей-площади тут
          }

          floor.areas.each do |area|
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
            floor_hash[:childs] << ab
          end

          childs << floor_hash

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
            rent_building_hash: hbu,
            # rent_building_hash: {
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
            img: b.img.url,
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

    def self.update_json

      # открываем файл на чтение
      locations_path = Rails.root.join("public", "locations.json")
      locs = File.read(locations_path)
      locs_hash = JSON.parse(locs)

      # поместим в него детей - здания со всеми детьми и внуками
      buildinds = []
      C80MapFloors::MapBuilding.all.each do |building|
        buildinds << building.as_json
      end

      locs_hash["buildinds"] = buildinds

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