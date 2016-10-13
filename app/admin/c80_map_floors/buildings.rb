ActiveAdmin.register C80MapFloors::Building do #, as: 'Building'

  menu :label => "Buildings", :parent => 'Карта', :if => proc { current_admin_user.email == 'tz007@mail.ru' }

  before_filter :skip_sidebar!, :only => :index

  permit_params :img_bg, :img_overlay, :coords, :tag

  config.sort_order = 'id_asc'

  index do
    column :tag
    # column :coords
    column 'img_bg' do |sp|
      "#{ link_to image_tag(sp.img_bg.thumb.url, :style => 'background-color: #cfcfcf;'), sp.img_bg.url, :target => '_blank' }<br>
      ".html_safe
    end
    # column 'img_overlay' do |sp|
    #   "#{ link_to image_tag(sp.img_overlay.thumb.url), sp.img_overlay.url, :target => '_blank' }<br>
    #   ".html_safe
    # end
    actions
  end

  form(:html => {:multipart => true}) do |f|

    f.inputs 'Properties' do
      f.input :tag
      f.input :coords
      f.input :img_bg, :hint => "#{image_tag(f.object.img_bg.thumb.url)}".html_safe
      f.input :img_overlay, :hint => "#{image_tag(f.object.img_overlay.thumb.url)}".html_safe
    end

    f.actions
  end

end