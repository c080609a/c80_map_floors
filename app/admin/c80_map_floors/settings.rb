ActiveAdmin.register C80MapFloors::Setting, as: 'Setting' do

  menu :label => "Свойства", :parent => 'Карта', :if => proc { current_admin_user.email == 'tz007@mail.ru' }

  before_filter :skip_sidebar!, :only => :index

  permit_params :map_image

  config.sort_order = 'id_asc'

  # controller do
  #   cache_sweeper :suit_sweeper, :only => [:update,:create,:destroy]
  # end

  index do
    column '' do |sp|
      "#{ link_to image_tag(sp.map_image.thumb.url), sp.map_image.url, :target => '_blank' }<br>
      ".html_safe
    end
    actions
  end

  form(:html => {:multipart => true}) do |f|

    f.inputs 'Свойства карты' do
      f.input :map_image, :hint => "#{image_tag(f.object.map_image.thumb.url)}".html_safe
    end

    f.actions
  end

end