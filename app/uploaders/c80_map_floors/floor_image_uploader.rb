module C80MapFloors

  # TODO:: FloorImageUploader класс должен использоваться только для загрузки img_bg [потому что 78aasq]

  class FloorImageUploader < CarrierWave::Uploader::Base

    include CarrierWave::MiniMagick

    storage :file

    version :thumb do
      process :resize_to_fit => [500,500]
    end

    def store_dir
      "uploads/map/floors"
    end

    def filename
      if original_filename
        "floor_#{secure_token(4)}.#{file.extension}"
      end
    end

    protected
    def secure_token(length=16)
      var = :"@#{mounted_as}_secure_token"
      model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.hex(length/2))
    end

  end

end