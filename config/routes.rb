C80MapFloors::Engine.routes.draw do
  match '/save_map_data', to: 'map_ajax#save_map_data', via: :post
  match '/ajax/map_edit_buttons', :to => 'ajax#map_edit_buttons', :via => :post

  match '/ajax/link_building', :to => 'ajax#link_building', :via => :post
  match '/ajax/link_floor', :to => 'ajax#link_floor', :via => :post
  match '/ajax/link_area', :to => 'ajax#link_area', :via => :post

  # слово unlinked - это рудимент, legacy from the past
  match '/ajax/fetch_unlinked_buildings', to: 'ajax#fetch_unlinked_buildings', via: :post
  match '/ajax/fetch_unlinked_floors', to: 'ajax#fetch_unlinked_floors', via: :post
  match '/ajax/fetch_unlinked_areas', to: 'ajax#fetch_unlinked_areas', via: :post
  match '/ajax/find_shops', to: 'ajax#find_shops', via: :post

end