ActiveAdmin.register C80MapFloors::MapBuilding, as: 'MapBuilding' do

  menu :label => 'Полигоны зданий', :parent => 'Карта'#, :if => proc { current_admin_user.email == 'tz007@mail.ru' }

  before_filter :skip_sidebar!, :only => :index

  permit_params :img, 
                :coords, 
                :tag

  config.sort_order = 'id_asc'

  index do
    column :id
    column :tag
    column :coords do |mp|
      d = mp.coords
      "<div style='width:100px;overflow:hidden;'>#{d}</div>".html_safe
    end
    column :created_at
    column :updated_at
    # column 'img' do |sp|
    #   "#{ link_to image_tag(sp.img.thumb.url, :style => 'background-color: #cfcfcf;'), sp.img.url, :target => '_blank' }<br>
    #   ".html_safe
    # end
    actions
  end

  form(:html => {:multipart => true}) do |f|

    f.inputs 'Свойства' do
      f.input :tag
      f.input :coords
      # f.input :img, :hint => "#{image_tag(f.object.img.thumb.url) if f.object.img.present?}".html_safe
    end

    f.actions
  end

end