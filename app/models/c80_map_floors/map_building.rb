# noinspection RubyResolve
require 'c80_map_floors/base_map_object'
require 'integer'

module C80MapFloors
  # noinspection RubyResolve
  class MapBuilding < ActiveRecord::Base

    include ActiveModel::Dirty

    has_many :floors, :class_name => 'C80MapFloors::Floor', :dependent => :destroy
    belongs_to :building_representator, :polymorphic => true

    after_create :calc_coords_img

    after_create :auto_assign_floors_by_ord
    after_update :auto_assign_floors_by_ord

    acts_as_base_map_object

    mount_uploader :img, C80MapFloors::BuildingImageUploader

    def areas
      C80MapFloors::Areas.joins(:c80_map_floors_floors).where(:building_id => self.if)
    end

    def my_as_json5

      result = {
          id: self.id,
          title: self.title,
          tag: self.tag,
          class_name: self.class_name,
          coords_img: self.coords_img,
          coords: self.coords,
          floors: [],
          data: nil
      }

      self.floors.each do |floor|
        result[:floors] << floor.my_as_json
      end

      if self.building_representator.present?
        result[:data] = self.building_representator.my_as_json6
      end

      result.as_json

    end

    # ISSUE: rails as_json except not working
    # ANSWER: For those looking here for a quick work around, it's burried in the comments,
    # but basically, you can work around by:
    # renaming your custom as_json to serializable_hash
    # github.com/rails/rails/pull/2200#issuecomment-3131652 – ChristopherJ Oct 16 '13 at 5:55
=begin
    def serializable_hash(options = nil)

      super({
                :except => [:created_at,:updated_at,:building_representator_type, :building_representator_id],
                :methods => [:class_name],
                :include => [
                    :floors => {
                        :except => [:created_at,:updated_at],
                        :methods => [:class_name, :img_bg_width, :img_bg_height],
                        :include => [
                            :areas => {
                                :except => [:created_at,:updated_at,:area_representator_type],
                                :methods => :class_name
                            }
                        ]
                    }
                ]
            }.merge(options || {} ))
    end
=end

    def calc_coords_img

      cs = self.coords.split(',') # 511,71,511,71,497,88,497,110,865,196,865,172,876,155

      #-> Рассчитаем весь bounding box, но вернём только верхний левый угол

      xmin = Integer::MAX.to_f
      ymin = Integer::MAX.to_f
      xmax = Integer::MIN.to_f
      ymax = Integer::MIN.to_f

      (0..cs.count-1).step(2) do |i|

        ix = cs[i].to_f
        iy = cs[i+1].to_f

        # Rails.logger.debug "[TRACE] <map_building.calc> #{ix}, #{iy}"

        xmin = ix < xmin ? ix : xmin
        ymin = iy < ymin ? iy : ymin

        xmax = ix > xmax ? ix : xmax
        ymax = iy > ymax ? iy : ymax

      end

      # bbox = {
      #     xmin: xmin,
      #     ymin: ymin,
      #     xmax: xmax,
      #     ymax: ymax
      # }

      str = [
          '%.01f' % xmin,
          '%.01f' % ymin
      ].join(',')

      self.update_column(:coords_img, str)

    end

    private

    # def update_json
    #   MapJson.update_json
    # end

    # связать Полигоны этажей (принадлежащие этому Полигону здания),
    # с ord-соответствующими этажами Здания (которое привязано к этому Полигону здания)
    def auto_assign_floors_by_ord
      Rails.logger.debug '[TRACE] <map_building.auto_assign_floors_by_ord> связать ПолигоныЭтажей с соответствующими ДаннымиЭтажей.'

      # если у Полигона сменилось Здание
      if self.building_representator_id_changed?
        Rails.logger.debug '[TRACE] <map_building.auto_assign_floors_by_ord> У Полигона сменилось Здание.'

        if self.building_representator_id_was.nil?
          Rails.logger.debug '[TRACE] <map_building.auto_assign_floors_by_ord> У Полигона не было данных до этого.'
        else
          Rails.logger.debug '[TRACE] <map_building.auto_assign_floors_by_ord> У Полигона уже были какие-то данные до этого. TODO очистить привязки.'
          # TODO:: если у ПолигонаЗдания БЫЛО Здание до этого - очистить привязки к данным у соответствующих ПолигоновЭтажей и ПолигоновПлощадей
        end

        # фиксируем текущие данные этого ПолигонаЗдания
        bdata = self.building_representator

        if bdata.present?
          Rails.logger.debug "[TRACE] <map_building.auto_assign_floors_by_ord> Данные ПолигонаЗдания: {title=#{bdata.title}, id=#{bdata.id}}"
          Rails.logger.debug '[TRACE] <map_building.auto_assign_floors_by_ord> Обходим ПолигоныЭтажей этого ПолигонаЗдания и назначаем им данныеЭтажей по ord.'

          # теперь ПРЕДВАРИТЕЛЬНО проверим, есть ли у ПолигонаЗдания ПолигоныЭтажи
          if self.floors.count > 0
            Rails.logger.debug '[TRACE] <map_building.auto_assign_floors_by_ord> У ПолигонаЗдания имеются ПолигоныЭтажей.'

            # еще ПРЕДВАРИТЕЛЬНО проверим, есть ли в ДанныхЗдания этажи
            if bdata.sfloors.count > 0
              Rails.logger.debug '[TRACE] <map_building.auto_assign_floors_by_ord> В Данных ПолигонаЗдания имеются данные об Этажах.'

              # ПРОСТО проверим, совпадает ли количество ЭтажейПолигонов и ЭтажейДанных
              if self.floors.count != bdata.sfloors.count
                Rails.logger.debug "[TRACE] [WARNING] <map_building.auto_assign_floors_by_ord> количество ЭтажейПолигонов (count=#{self.floors.count}) и ЭтажейДанных (count=#{bdata.sfloors.count}) НЕ совпадает."
              end

              link_floor_sfloor(bdata)

            else
              Rails.logger.debug '[TRACE] [ERROR] <map_building.auto_assign_floors_by_ord> В ДанныхЗдания нет этажей.'
            end

          else
            Rails.logger.debug '[TRACE] [ERROR] <map_building.auto_assign_floors_by_ord> У ПолигонаЗдания нет ПолигоновЭтажей.'
          end

        else
          Rails.logger.debug '[TRACE] [WARNING] <map_building.auto_assign_floors_by_ord> У ПолигонаЗдания нет данных.'
        end

      end

    end

    def link_floor_sfloor(building_representator)
      Rails.logger.debug "[TRACE] <map_building.link_floor_sfloor> СВЯЗЫВАЕМ ПОЛИГОНЫ-ЭТАЖЕЙ C ДАННЫМИ. MapBuilding.id=#{self.id}"

      # обходим ПолигоныЭтажей этого ПолигонаЗдания и назначаем им данныеЭтажей по ord
      Rails.logger.debug '[TRACE] <map_building.link_floor_sfloor> Перебираем ПолигоныЭтажей...'
      self.floors.each do |floor|
        Rails.logger.debug "[TRACE] <map_building.link_floor_sfloor> Фиксируем ПолигонЭтажа ord=#{floor.ord}."

        # фиксируем ord-соответствующие данныеЭтажа  (dev.. но сначала добавим в данныеЗдания данныеЭтажей)
        may_be_sfloors = building_representator.sfloors.where(:ord => floor.ord)
        if may_be_sfloors.count > 0

          # данныеЭтажа
          sfloor = may_be_sfloors.first
          Rails.logger.debug "[TRACE] <map_building.link_floor_sfloor> Фиксируем ДанныеЭтажа: #{sfloor.my_as_json3}."

          #-> связываем
          Rails.logger.debug '[TRACE] <map_building.link_floor_sfloor> Связываем..'
          floor.map_floor_representator = sfloor
          floor.save!
          # SQL (0.5ms)  UPDATE `c80_map_floors_floors` SET `map_floor_representator_id` = 2, `map_floor_representator_type` = 'Sfloor', `updated_at` = '2016-11-28 16:54:43.700446' WHERE `c80_map_floors_floors`.`id` = 3

        else
          Rails.logger.debug '[TRACE] [ERROR] <map_building.auto_assign_floors_by_ord> В ДанныхЗдания нет соответствующего этажа.'
        end

      end
    end

  end
end