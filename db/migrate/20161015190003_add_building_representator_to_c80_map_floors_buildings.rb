class AddBuildingRepresentatorToC80MapFloorsBuildings < ActiveRecord::Migration
  def change
    add_reference :c80_map_floors_map_buildings, :building_representator, index: true
    add_column :c80_map_floors_map_buildings, :building_representator_type, :string, :default => 'Rent::Building'
  end
end
