## 20170323: stroy101map
# Предназначен для сбора данных о результате поиска
# (see /home/scout/git/research/kata_ruby/spec/003_my_arrays_spec.rb)

module C80MapFloors

  class SearchResult

    attr_reader :data

    def initialize
      @data = {
          buildings:             [],    # содержит айдишники полигонов зданий, в которых найдены магазины
          buildings_shops_count: [],    # содержит кол-во найденных в *соответствующем* здании магазинов
          floors:                [],    # содержит айдишники картинок этажей, в которых найдены магазины
          floors_shops_count:    [],    # содержит кол-во найденных магазинов на *соответствующей* картинке этажа
          areas:                 []     # сюда собираем айдишники полигонов площадей
      }
    end

    def add_floor(floor_id)
      indx = @data[:floors].index(floor_id.to_i)
      if indx.nil?
        @data[:floors] << floor_id.to_i
        @data[:floors_shops_count] << 1
      else
        @data[:floors_shops_count][indx] += 1
      end
    end

    def add_building(building_id)
      indx = @data[:buildings].index(building_id.to_i)
      if indx.nil?
        @data[:buildings] << building_id.to_i
        @data[:buildings_shops_count] << 1
      else
        @data[:buildings_shops_count][indx] += 1
      end
    end

    def add_area(area_id)
      indx = @data[:areas].index(area_id.to_i)
      if indx.nil?
        @data[:areas] << area_id.to_i
      end
    end



    # for testing (see /home/scout/git/research/kata_ruby/spec/003_my_arrays_spec.rb)

    def floors
      @data[:floors]
    end

    def floors_shops_count
      @data[:floors_shops_count]
    end

    def buildings
      @data[:buildings]
    end

    def areas
      @data[:areas]
    end

    def buildings_shops_count
      @data[:buildings_shops_count]
    end

  end

end