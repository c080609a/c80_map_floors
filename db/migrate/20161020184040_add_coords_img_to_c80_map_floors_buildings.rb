class AddCoordsImgToC80MapFloorsBuildings < ActiveRecord::Migration
  def change
    add_column :c80_map_floors_map_buildings, :coords_img, :string, :default => '1000,1000'
  end
end
