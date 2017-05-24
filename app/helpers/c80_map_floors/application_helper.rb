module C80MapFloors
  module ApplicationHelper

    def render_map

      # map_settings = C80MapFloors::Setting.first


      # т.к. в json попадают строки вида
      # /home/scout/git/bitbucket/vorsa/public/uploads/map/map.jpg
      # извлечём эту строку, затем во вью обработаем её image_path

      p = Rails.root.join("public", "locations.json")
      locs = File.read(p)
      locs_hash = JSON.parse(locs)
      locs_hash["img"] = image_path(locs_hash["img"])

      render :partial => 'c80_map_floors/map_row_index',
             :locals => {
                 locs_hash: locs_hash,
                 mapwidth: locs_hash["mapwidth"],
                 mapheight: locs_hash["mapheight"]
             }

    end

    # рендер поисковой формы, которая видна сверху поцентру в слое над картой
    # noinspection RubyResolve
    def render_search_input

      # NOTE:: названия всех категорий в алфавитном порядке через запятую в одну строку возьмём из HOST-приложения
      cl = ::Category.filled_cats.map { |c| c.name }.join(', ')

      # NOTE:: названия всех магазинов, у которых есть площадь, через запятую в одну строку возьмём из HOST-приложения
      sl = ::Leaser.assigned_to_areas.map { |e| e }.join(' (магазин), ')
      sl = "#{sl} (магазин)" # про последний элемент не забудем

      render :partial => 'c80_map_floors/shared/map_row/search_gui',
             :locals => {
                 # categories_list: categories_list
                 categories_list: [cl, sl].join(', ')
             }

    end

  end
end
