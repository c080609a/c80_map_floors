require 'c80_map_floors/base_map_object'

module C80MapFloors
  class Floor < ActiveRecord::Base

    belongs_to :map_building
    has_many :areas, :class_name => 'C80MapFloors::Area', :dependent => :destroy
    acts_as_base_map_object

    # validates :coords, uniqueness: true
    after_save :update_json

    mount_uploader :img_bg, C80MapFloors::FloorImageUploader   # TODO:: FloorImageUploader класс должен использоваться только для загрузки img_bg [потому что 78aasq]
    mount_uploader :img_overlay, C80MapFloors::FloorImageUploader

    # NOTE:: Т.к. для этажей используются картинки в два раза детальнее (в два раза больше, чем оригинал карты), то делим попалам
    # размеры картинки уйдут в js - они помогут её css-абсолютно правильно масштабировать и позиционировать
    def img_bg_width
      res = nil
      if img_bg.present?
        img = MiniMagick::Image.open(img_bg.path)
        res = img["width"]/2
      end
      res
    end

    def img_bg_height
      res = nil
      if img_bg.present?
        img = MiniMagick::Image.open(img_bg.path)
        res = img["height"]/2
      end
      res
    end
    
    def img_bg_url
      res = nil
      if img_bg.present?
        res = img_bg.url
      end
      res      
    end
    
    def img_overlay_url
      res = nil
      if img_overlay.present?
        res = img_overlay.url
      end
      res      
    end

    # private

    # TODO:: после того, как апдейтим этаж, не обновляются данные в JSON - изза ебучей ошибки с путями в CarrierWave
    # Т.е. нужно руками, после того, как в базу лягут актуальные данные, вызвать save! какого-нибудь building
    def update_json
      Rails.logger.debug "[TRACE] <update_json> nope"
      # MapJson.update_json
    end

    def my_as_json

      result = {
          ord: self.ord,
          id: self.id,
          title: self.title,
          tag: self.tag,
          class_name: self.class_name,
          map_building_id: self.map_building_id,
          img_bg: {
              url: self.img_bg_url
          },
          img_overlay: {
              url: self.img_overlay_url
          },
          img_bg_width: img_bg_width,
          img_bg_height: img_bg_height,
          coords: self.coords,
          areas: [],
          data: nil
      }

      self.areas.each do |area|
        result[:areas] << area.my_as_json
      end

      # if self.floor_representator.present?
      #   result[:data] = self.floor_representator.my_as_json
      # end

      result.as_json

    end

  end
end