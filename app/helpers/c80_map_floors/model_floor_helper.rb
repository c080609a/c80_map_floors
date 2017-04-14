# Предыстория: изначально карта создавалась на основе арта 101км.
# Чтобы при приближении к картинке этажа не возникало мыла,
# я их готовил размерами в 2 раза больше.
# Теперь пришёл единый psd (карта s40), в котором картинки этажей
# уже размещены и позиционированы поверх картинки карты. И нет
# надобности увеличивать их в 2 раза.
#
# Поэтому: методы модели Floor обращаются теперь к этому хелперу,
# задача которого - выдавать размеры картинок этажей. 20170413
# + в host приложении можно переопределить этот функционал.
#
module C80MapFloors
  module ModelFloorHelper

    def get_width(image)
      img = MiniMagick::Image.open(image.path)
      img['width']/2
    end
    
    def get_height(image)
      img = MiniMagick::Image.open(image.path)
      img['height']/2
    end

  end
end