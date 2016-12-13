module C80MapFloors
  class AjaxController < ApplicationController

    def map_edit_buttons
      # puts "<AjaxController.map_edit_buttons> #{params}"
    end

    def fetch_unlinked_areas
      # Rails.logger.debug "<AjaxController.fetch_unlinked_areas> params = #{params}"

      @unlinked_areas = Rent::Area.unlinked_areas

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
      # Rails.logger.debug "<AjaxController.fetch_unlinked_buildings> params = #{params}"

      @unlinked_buildings = Rent::Building.unlinked_buildings

    end

    # связать Rent::Area и Map::Area
    # в процессе произойдёт обновление json-файла с данными
    def link_area
      Rails.logger.debug "<AjaxController.link_area> params = #{params}"

      # TODO:: т.к. ПОКА используем этот gem только в stroy101, то должно быть не Rent::Area
      rent_area = Rent::Area.find(params[:rent_area_id])
      map_area = C80Map::Area.find(params[:map_area_id])
      rent_area.map_areas.delete_all
      rent_area.map_areas << map_area
      rent_area.save

      result = {
          updated_locations_json: C80Map::MapJson.fetch_json
      }

      respond_to do |format|
        format.json { render json: result }
      end

    end

    #
    def link_building

      Rails.logger.debug "<AjaxController.link_building> params = #{params}"

      rent_building = Rent::Building.find(params[:rent_building_id])
      map_building = C80Map::MapBuilding.find(params[:map_building_id])
      rent_building.map_buildings.delete_all
      rent_building.map_buildings << map_building
      rent_building.save

      result = {
          updated_locations_json: C80Map::MapJson.fetch_json
      }

      respond_to do |format|
        format.json { render json: result }
      end

    end

  end
end