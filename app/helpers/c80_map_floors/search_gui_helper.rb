module C80MapFloors
  module SearchGuiHelper

    # рендер поисковой формы, которая видна сверху поцентру в слое над картой
    # noinspection RubyResolve
    def render_search_gui

      # NOTE:: названия всех категорий в алфавитном порядке через запятую в одну строку возьмём из HOST-приложения
      categories_list = ::Cat.filled_cats.map { |c| c.name }.join(', ')

      render :partial => 'c80_map_floors/shared/map_row/search_gui',
             :locals => {
                 categories_list: categories_list
             }

    end

  end
end