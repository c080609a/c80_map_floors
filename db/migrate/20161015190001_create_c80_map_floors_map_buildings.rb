class CreateC80MapFloorsMapBuildings < ActiveRecord::Migration
  def change
    create_table :c80_map_floors_map_buildings, :options => 'COLLATE=utf8_unicode_ci' do |t|
      t.string :tag
      t.text :coords
      t.string :img
      t.timestamps
    end
  end
end
