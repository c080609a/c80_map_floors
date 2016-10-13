class CreateC80MapFloorsBuildings < ActiveRecord::Migration
  def change
    create_table :c80_map_floors_buildings, :options => 'COLLATE=utf8_unicode_ci' do |t|
      t.string :tag
      t.text :coords
      t.string :img_bg
      t.string :img_overlay
      t.timestamps
    end
  end
end
