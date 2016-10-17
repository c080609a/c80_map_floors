# rake db:seed:c80_map_floors_01_fill_map_settings

C80MapFloors::Setting.delete_all
C80MapFloors::Setting.create({
                           map_image:nil
                       })