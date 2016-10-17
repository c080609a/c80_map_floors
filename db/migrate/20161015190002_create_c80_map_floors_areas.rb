class CreateC80MapFloorsAreas < ActiveRecord::Migration
  def change
    create_table :c80_map_floors_areas, :options => 'COLLATE=utf8_unicode_ci' do |t|
      t.text :tag
      t.text :coords
      t.references :floor, index: true
      t.string :area_representator_type, :default => 'Rent::Area'
      t.references :area_representator, index: true
      t.timestamps
    end
  end
end
