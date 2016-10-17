class CreateC80MapFloorsFloors < ActiveRecord::Migration
  def change
    create_table :c80_map_floors_floors, :options => 'COLLATE=utf8_unicode_ci' do |t|

      t.string :title
      t.string :tag
      t.integer :ord
      t.text :coords
      t.string :img_bg
      t.string :img_overlay
      t.references :map_building, index: true
      t.timestamps

    end
  end
end
