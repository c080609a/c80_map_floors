module C80MapFloors
  class MapAjaxController < ApplicationController

    def save_map_data
      # Rails.logger.debug "<MapAjaxController.save_map_data> params = #{params}"

      #{ "buildings"=>{"0"=>{"coords"=>["2496.5894495412845",...]}} }

      # ЗДАНИЯ
      # в случае успеха - вернём id созданного здания,
      # тогда js обновит id и перенесёт здание из массива "новые здания" (drawn_buildings).
      # в случае неудачи - вернём описание ошибки
      # завершаем всё обновленным locations.json, который Map возьмёт
      # и положит в data

      # ПЛОЩАДИ
      #
      # как было:
      # {"areas"=>{"0"=>{"id"=>"61319", "coords"=>[..], "parent_building_id"=>"2"}}}
      # как стало:
      # {"areas"=>{"0"=>{"id"=>"61319", "coords"=>[..], "parent_floor_id"=>"2"}}}
      # ...
      # INSERT INTO `c80_map_floors_areas` (`coords`, `floor_id`, `created_at`, `updated_at`) VALUES ('...', 2, '2016-12-11 05:48:33.629883', '2016-12-11 05:48:33.629883')
      #
      #


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

      # затем создадим площади
      if params[:areas].present?
        params[:areas].each_key do |key|
          new_area_options = params[:areas][key]
          # Rails.logger.debug "<MapAjaxController.save_map_data> new_area_options = #{new_area_options}"
          # puts "<MapAjaxController.save_map_data> new_area_options[:coords] = #{new_area_options[:coords]}"
          a = C80MapFloors::Area.new({
                           coords: new_area_options[:coords].join(','),
                           floor_id: new_area_options[:parent_floor_id]
                       })

          if a.valid?
            a.save
            result[:areas] << { id: a.id, old_temp_id: new_area_options["id"] }
          else
            result[:areas] << { id: new_area_options.id, status: 'error' }
          end
        end
      end

      if params[:deleted_areas].present?
        params[:deleted_areas].each do |area_id|
          # Rails.logger.debug "[TRACE] <map_ajax_controller.save_map_data> area_id = #{area_id}."
          # [TRACE] <map_ajax_controller.save_map_data> area_id = 43.
          area = C80MapFloors::Area.find(area_id)
          area.destroy
        end
      end

      MapJson.update_json

    rescue ActiveRecord::RecordNotFound
      Rails.logger.debug '[TRACE] <MapAjaxController.save_map_data> record not found'
      MapJson.update_json

    end

  end
end