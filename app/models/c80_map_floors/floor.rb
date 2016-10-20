require 'c80_map_floors/base_map_object'

module C80MapFloors
  class Floor < ActiveRecord::Base

    belongs_to :map_building
    has_many :areas, :class_name => 'C80MapFloors::Area', :dependent => :destroy
    acts_as_base_map_object

    # validates :coords, uniqueness: true
    # after_save :update_json

    mount_uploader :img_bg, C80MapFloors::FloorImageUploader   # TODO:: FloorImageUploader класс должен использоваться только для загрузки img_bg [потому что 78aasq]
    mount_uploader :img_overlay, C80MapFloors::FloorImageUploader

    # NOTE:: Т.к. для этажей используются картинки в два раза детальнее (в два раза больше, чем оригинал карты), то делим попалам
    # размеры картинки уйдут в js - они помогут её css-абсолютно правильно масштабировать и позиционировать
    def img_bg_width
      img = MiniMagick::Image.open(img_bg.path)
      img["width"]/2
    end

    def img_bg_height
      img = MiniMagick::Image.open(img_bg.path)
      img["height"]/2
    end

    # private

    # TODO:: после того, как апдейтим этаж, не обновляются данные в JSON - изза ебучей ошибки с путями в CarrierWave
    def update_json
      Rails.logger.debug "[TRACE] <update_json> nope"
      # MapJson.update_json
    end

  end
end