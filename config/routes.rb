C80MapFloors::Engine.routes.draw do
  match '/save_map_data', to: 'map_ajax#save_map_data', via: :post
  match '/ajax/map_edit_buttons', :to => 'ajax#map_edit_buttons', :via => :post
  match '/ajax/link_floor', :to => 'ajax#link_floor', :via => :post

  match '/ajax/fetch_unlinked_floors', to: 'ajax#fetch_unlinked_floors', via: :post
end