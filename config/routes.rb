C80MapFloors::Engine.routes.draw do
  match '/save_map_data', to: 'map_ajax#save_map_data', via: :post
  match '/ajax/map_edit_buttons', :to => 'ajax#map_edit_buttons', :via => :post
end