ActiveAdmin.register C80MapFloors::Floor, as: 'Floor' do

  menu :label => "Этажи", :parent => 'Карта'#, :if => proc { current_admin_user.email == 'tz007@mail.ru' }

  before_filter :skip_sidebar!, :only => :index

  permit_params :title,
                :img_bg,
                :img_overlay,
                :coords,
                :tag,
                :ord,
                :map_building_id

  config.sort_order = 'id_asc'

  index do
    column :map_building
    column :title
    column :ord
    column :tag
    # column :coords
    column 'img_bg' do |floor|
      "#{ link_to image_tag(floor.img_bg.thumb.url, :style => 'background-color: #cfcfcf;'), floor.img_bg.url, :target => '_blank' }<br>
      ".html_safe
    end
    column :areas do |floor|
      res = ''
      floor.areas.all.map { |area| res += "<li>Полигон площади id=#{area.id}</li>" }
      res += "<li><strong>Всего полигонов: #{floor.areas.count}</strong></li>"
      "<ul>#{res}</ul>".html_safe
    end
    # column 'img_overlay' do |sp|
    #   "#{ link_to image_tag(sp.img_overlay.thumb.url), sp.img_overlay.url, :target => '_blank' }<br>
    #   ".html_safe
    # end
    actions
  end

  form(:html => {:multipart => true}) do |f|

    f.inputs 'Properties' do
      f.input :title
      f.input :tag
      f.input :ord
      f.input :coords
      f.input :img_bg, :hint => "#{image_tag(f.object.img_bg.thumb.url)}".html_safe
      # f.input :img_overlay, :hint => "#{image_tag(f.object.img_overlay.thumb.url)}".html_safe
      f.input :map_building,
              :collection => C80MapFloors::MapBuilding.all.map { |building| ["#{building.title} (id=#{building.id})", building.id]}

    end

    f.actions
  end

end