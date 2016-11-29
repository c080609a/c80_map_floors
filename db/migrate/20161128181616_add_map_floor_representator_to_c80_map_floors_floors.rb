class AddMapFloorRepresentatorToC80MapFloorsFloors < ActiveRecord::Migration
  def change
    add_reference :c80_map_floors_floors, :map_floor_representator, index: true
    add_column :c80_map_floors_floors, :map_floor_representator_type, :string, :default => 'Floor'
  end
end
