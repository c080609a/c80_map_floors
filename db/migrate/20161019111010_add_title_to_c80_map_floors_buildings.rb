class AddTitleToC80MapFloorsBuildings < ActiveRecord::Migration
  def change
    add_column :c80_map_floors_map_buildings, :title, :string, :default => 'noname'
  end
end
