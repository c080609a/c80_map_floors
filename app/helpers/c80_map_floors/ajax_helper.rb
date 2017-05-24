module C80MapFloors
  module AjaxHelper
    def find_areas_by_category!(result)
      # 1. Находим категорию, title которой равен строке.
      cats   = ::Category.where(:name => params[:stext])
      if cats.count > 0
        # работаем только с первой попавшейся категорией
        cat = cats[0]

        # если у категории имеются связанные магазины
        if cat.leasers.count > 0

          # переберём их
          cat.leasers.each do |shop|

            # добираемся до Rent::Area каждого магазина
            if shop.areas.count > 0

              shop.areas.each do |rent_area|

                # если у Rent::Area имеется связанный полигон
                if rent_area.area.present? # has_one

                  map_area = rent_area.area

                  # NOTE:: теперь, зная C80MapFloors::Area.id, находим id полигона этажа и id полигона здания

                  Rails.logger.debug "[TRACE] <AjaxController.find_shops> add_area: #{map_area.id}"
                  # result[:areas] << rent_area.area.id
                  result.add_area(map_area.id)

                  # посмотрим, имеется ли у полигона площади родители
                  if map_area.floor.present?

                    map_floor = map_area.floor
                    Rails.logger.debug "[TRACE] <AjaxController.find_shops> add_floor: #{map_floor.id}"
                    result.add_floor(map_floor.id)

                    if map_floor.map_building.present?
                      Rails.logger.debug "[TRACE] <AjaxController.find_shops> add_building: #{map_floor.map_building}"
                      result.add_building(map_floor.map_building.id)
                    else
                      Rails.logger.debug "[TRACE] <AjaxController.find_shops> У Rent::Area нет родителей: #{rent_area.name}"
                    end

                  else
                    Rails.logger.debug "[TRACE] <AjaxController.find_shops> У полигона площади нет родителей: #{rent_area.name}"
                  end


                else
                  Rails.logger.debug "[TRACE] <AjaxController.find_shops> У Rent::Area нет полигона: #{rent_area.name}"
                end

              end

            else
              Rails.logger.debug "[TRACE] <AjaxController.find_shops> У магазина нет Rent::Area: #{shop.name}"
            end

          end

        else
          Rails.logger.debug "[TRACE] <AjaxController.find_shops> У этой категории нет магазинов: #{params[:stext]}"
        end

      else
        Rails.logger.debug "[TRACE] <AjaxController.find_shops> Нет категории с таким именем = #{params[:stext]}"
      end
    end
  end
end