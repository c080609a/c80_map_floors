module C80MapFloors
  class MapAjaxController < ApplicationController

    def save_map_data
      # Rails.logger.debug "<MapAjaxController.save_map_data> params = #{params}"

      #{ "buildings"=>{"0"=>{"coords"=>["2496.5894495412845",...]}} }
      #{ "areas"=>{"0"=>{"coords"=>["2496.5894495412845",...]}} }

      # ЗДАНИЯ
      # в случае успеха - вернём id созданного здания,
      # тогда js обновит id и перенесёт здание из массива "новые здания" (drawn_buildings).
      # в случае неудачи - вернём описание ошибки
      # завершаем всё обновленным locations.json, который Map возьмёт
      # и положит в data

      result = {
          areas: [],
          buildings: [],
          updated_locations_json: nil
      }

      # сначала создадим здания
      if params[:buildings].present?
        params[:buildings].each_key do |key|
          new_building_options = params[:buildings][key]
          # puts "<MapAjaxController.save_map_data> new_building_options = #{new_building_options}"
          # puts "<MapAjaxController.save_map_data> new_building_options[:coords] = #{new_building_options[:coords]}"
          b = C80MapFloors::MapBuilding.new({ coords: new_building_options[:coords].join(',') })

          if b.valid?
            b.save
            result[:buildings] << { id: b.id, old_temp_id: new_building_options["id"] }
          else
            result[:buildings] << { id: new_building_options.id, status: 'error' }
          end
        end
      end

      # затем создадим области
      if params[:areas].present?
        params[:areas].each_key do |key|
          new_area_options = params[:areas][key]
          # Rails.logger.debug "<MapAjaxController.save_map_data> new_area_options = #{new_area_options}"
          # puts "<MapAjaxController.save_map_data> new_area_options[:coords] = #{new_area_options[:coords]}"
          a = C80MapFloors::Area.new({
                           coords: new_area_options[:coords].join(','),
                           map_building_id: new_area_options[:parent_building_id]
                       })

          if a.valid?
            a.save
            result[:areas] << { id: a.id, old_temp_id: new_area_options["id"] }
          else
            result[:areas] << { id: new_area_options.id, status: 'error' }
          end
        end
      end

      result[:updated_locations_json] = MapJson.fetch_json

      puts "<MapAjaxController.save_map_data> result = #{result.to_json}"

      respond_to do |format|
        format.json { render json: result }
      end
    end

  end
end