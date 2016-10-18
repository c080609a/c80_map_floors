# rake db:seed:c80_map_floors_02_create_test_area

C80MapFloors::Area.create!({
                               coords: '10 12',
                               tag: 'test_area',
                               floor_id: C80MapFloors::Floor.first.id
                           })