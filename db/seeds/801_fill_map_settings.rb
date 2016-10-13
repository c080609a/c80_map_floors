# rake db:seed:801_fill_map_settings

C80MapFloors::Setting.delete_all
C80MapFloors::Setting.create({
                           map_image:nil
                       })