module C80MapFloors
  module AjaxHelper

    def find_areas_by_category!(result, stext)
      # 1. Находим категорию, title которой равен строке.
      cats   = ::Category.where(:name => stext)
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
          Rails.logger.debug "[TRACE] <AjaxController.find_shops> У этой категории нет магазинов: #{stext}"
        end

      else
        Rails.logger.debug "[TRACE] <AjaxController.find_shops> Нет категории с таким именем = #{stext}"
      end
    end

    def find_areas_by_shop!(result, stext)
      shop_name = stext.gsub(' (магазин)','')
      shops = ::Leaser.where(:name => shop_name)
      Rails.logger.debug "[TRACE] <AjaxHelper> shops.count = #{shops.count}"

      if shops.count > 0
        # работаем только с первым попавшимся магазином
        shop = shops[0]

        _process_shop_areas!(result, shop)

      end

    end

    private

    def _process_shop_areas!(result, shop)
      # добираемся до Rent::Area каждого магазина
      if shop.areas.count > 0

        shop.areas.each do |rent_area|

          # если у Rent::Area имеется связанный полигон
          if rent_area.area.present? # has_one

            map_area = rent_area.area

            # NOTE:: теперь, зная C80MapFloors::Area.id, находим id полигона этажа и id полигона здания

            Rails.logger.debug "[TRACE] <AjaxHelper._process_shop_areas!> add_area: #{map_area.id}"
            # result[:areas] << rent_area.area.id
            result.add_area(map_area.id)

            # посмотрим, имеется ли у полигона площади родители
            if map_area.floor.present?

              map_floor = map_area.floor
              Rails.logger.debug "[TRACE] <AjaxHelper._process_shop_areas!> add_floor: #{map_floor.id}"
              result.add_floor(map_floor.id)

              if map_floor.map_building.present?
                Rails.logger.debug "[TRACE] <AjaxHelper._process_shop_areas!> add_building: #{map_floor.map_building}"
                result.add_building(map_floor.map_building.id)
              else
                Rails.logger.debug "[TRACE] <AjaxHelper._process_shop_areas!> У Rent::Area нет родителей: #{rent_area.name}"
              end

            else
              Rails.logger.debug "[TRACE] <AjaxHelper._process_shop_areas!> У полигона площади нет родителей: #{rent_area.name}"
            end


          else
            Rails.logger.debug "[TRACE] <AjaxHelper._process_shop_areas!> У Rent::Area нет полигона: #{rent_area.name}"
          end

        end

      else
        Rails.logger.debug "[TRACE] <AjaxHelper._process_shop_areas!> У магазина нет Rent::Area: #{shop.name}"
      end
    end

  end
end