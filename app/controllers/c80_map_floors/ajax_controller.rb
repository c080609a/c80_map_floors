require 'search_result'

module C80MapFloors
  # noinspection RubyResolve
  class AjaxController < ApplicationController

    include AjaxHelper

    def map_edit_buttons
      # puts "<AjaxController.map_edit_buttons> #{params}"
    end

    # прислать ВСЕ Площади указанного Этажа
    def fetch_unlinked_areas
      Rails.logger.debug "[TRACE] <AjaxController.fetch_unlinked_areas> params = #{params}"
      # <AjaxController.fetch_unlinked_areas> params = {"sfloor_id"=>"1", "controller"=>"c80_map_floors/ajax", "action"=>"fetch_unlinked_areas"}

      # Sfloor - принадлежит моделям host-проекта (в частности, stroy101km)
      # noinspection RubyResolve
      @sfloor_areas = ::Floor.find(params[:sfloor_id].to_i).areas
      Rails.logger.debug "[TRACE] <AjaxController.fetch_unlinked_areas> @sfloor_areas.count = #{@sfloor_areas.count}"

    end

    # js-кнопка "связать полигон с этажом" запрашивает список несвязанных с полигонами Этажи (указанного здания)
    def fetch_unlinked_floors
      Rails.logger.debug "[TRACE] <AjaxController.fetch_unlinked_floors> params = #{params}"
      # [TRACE] <AjaxController.fetch_unlinked_floors> params = {"building_id"=>"1", "controller"=>"c80_map_floors/ajax", "action"=>"fetch_unlinked_floors"}

      # меняем логику - делаем менее строгой, теперь присылаются ВСЕ этажи указанного Здания
      # @unlinked_floors = Sfloor.unlinked_floors(params[:building_id]) # Sfloor - Этаж из host app, который еще и floor_representator

      # Building - принадлежит моделям host-проекта (в частности, stroy101km)
      # noinspection RubyResolve
      @building_sfloors = Building.find(params[:building_id].to_i).sfloors

    end

    def fetch_unlinked_buildings
      Rails.logger.debug "[TRACE] <AjaxController.fetch_unlinked_buildings> params = #{params}"

      @unlinked_buildings = Building.all.order_title

    end

    # связать Rent::Area и Map::Area
    # в процессе произойдёт обновление json-файла с данными
    # noinspection RubyResolve
    def link_area
      Rails.logger.debug "[TRACE] <AjaxController.link_area> params = #{params}"
      # [TRACE] <AjaxController.link_area> params = {"area_id"=>"364", "apolygon_id"=>"3", "controller"=>"c80_map_floors/ajax", "action"=>"link_area"}

      # фиксируем участников
      rent_area = ::Area.find(params[:area_id])
      area      = C80MapFloors::Area.find(params[:apolygon_id])

      # rent_area has_one area(полигон)
      rent_area.area.delete if rent_area.area.present?
      rent_area.area = area
      rent_area.save

      result = {
          updated_locations_json: C80MapFloors::MapJson.fetch_json
      }

      respond_to do |format|
        format.json { render json: result }
      end

    end

    #
    # noinspection RubyResolve
    def link_building

      Rails.logger.debug "[TRACE] <AjaxController.link_building> params = #{params}"
      # [TRACE] <AjaxController.link_building> params = {"rent_building_id"=>"29", "map_building_id"=>"10", "controller"=>"c80_map_floors/ajax", "action"=>"link_building"}
      rent_building = ::Building.find(params[:building_id])

      map_building = C80MapFloors::MapBuilding.find(params[:map_building_id])

      rent_building.map_building.delete if rent_building.map_building.present?
      rent_building.map_building = map_building
      rent_building.save

      result = {
          updated_locations_json: C80MapFloors::MapJson.fetch_json
      }

      respond_to do |format|
        format.json { render json: result }
      end

    end

    # связать Этаж и Картинку Этажа (обновится JSON карты)
    def link_floor
      Rails.logger.debug "[TRACE] <AjaxController.link_floor> params = #{params}"
      # <AjaxController.link_floor> params = {"sfloor_id"=>"3", "floor_id"=>"2", "controller"=>"c80_map_floors/ajax", "action"=>"link_floor"}

      # фиксируем участников
      sfloor = ::Floor.find(params[:sfloor_id])
      floor  = C80MapFloors::Floor.find(params[:floor_id])

      # sfloor has_one floor
      sfloor.floor.delete if sfloor.floor.present?
      sfloor.floor = floor
      sfloor.save

      result = {
          updated_locations_json: C80MapFloors::MapJson.fetch_json
      }

      respond_to do |format|
        format.json { render json: result }
      end

    end

    def find_shops
      Rails.logger.debug "[TRACE] <AjaxController.find_shops> params = #{params}"
      # [TRACE] <AjaxController.find_shops> params = {"stext"=>"Ванны акриловые", "counter"=>"1", }

      # result = {
      #     buildings:             [],
      #     buildings_shops_count: [],
      #     floors:                [],    #
      #     floors_shops_count:    [],
      #     areas:                 []     # сюда собираем айдишники полигонов площадей
      # }

      result = SearchResult.new

      find_areas_by_category!(result)

      Rails.logger.debug "[TRACE] <AjaxController.find_shops> Отправляем ответ: result = #{result.data}"

      respond_to do |format|
        format.json { render json: result.data }
      end

    end

    # от js пришла строка с названием категории. Необходимо найти магазины, соответствующие этой категории.
    # noinspection RailsChecklist01
    def _find_shops
      Rails.logger.debug "[TRACE] <AjaxController.find_shops> params = #{params}"
      # [TRACE] <AjaxController.find_shops> params = {"stext"=>"Хозтовары", "counter"=>"1", "controller"=>"c80_map_floors/ajax", "action"=>"find_shops"}

      # ПЕРВЫЙ ВАРИАНТ
      # result = {
      #     buildings: [
      #         {   id: 7,
      #             floors: [
      #                 {  id: 2,
      #                    areas: [3]
      #                 }
      #             ]
      #         },
      #         {
      #             id: 10,
      #             floors: [
      #                 { id: 6,
      #                   areas: [5,8]
      #                 },
      #                 { id: 48,
      #                   areas: [6]
      #                 }
      #             ]
      #         }
      #     ]
      # }

      if params[:counter].to_i == 1
        result = {
            buildings:             [7, 10],
            buildings_shops_count: [3, 12],
            floors:                [5, 7, 48, 8],
            floors_shops_count:    [2, 1, 33],
            areas:                 [3, 5, 8, 6]
        }
      else
        result = {
            buildings:             [],
            buildings_shops_count: [],
            floors:                [],
            floors_shops_count:    [],
            areas:                 []
        }

        # находим 3 рандомных полигона зданий (генерим случайное число для каждого здания)
        3.times do

          map_building       = MapBuilding.offset(rand(MapBuilding.count)).first
          map_building_count = rand(20)

          result[:buildings] << map_building.id
          result[:buildings_shops_count] << map_building_count

          # в каждом полигоне здания находим один рандомный полигон этажа (генерим случайное число для каждого этажа)
          map_floor       = map_building.floors.offset(rand(map_building.floors.count)).first
          map_floor_count = rand(20)

          result[:floors] << map_floor.id
          result[:floors_shops_count] << map_floor_count

          # просто находим 4 рандомных полигонов площадей
          4.times do
            map_area = Area.offset(rand(Area.count)).first
            result[:areas] << map_area.id
          end

        end

      end

      Rails.logger.debug "[TRACE] <AjaxController.find_shops> Отправляем ответ: result = #{result}"

      respond_to do |format|
        format.json { render json: result }
      end

    end

    # перегенерировать locations.json
    def update_map_json
      MapJson.update_json
    end

  end
end