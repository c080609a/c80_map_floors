C80MapFloors::Engine.routes.draw do
  match '/save_map_data', to: 'map_ajax#save_map_data', via: :post
end