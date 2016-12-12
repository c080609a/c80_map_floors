#= require history_jquery
#= require bootstrap/transition
# require bootstrap/modal # Bootstrap Modal immediately disappearing: http://stackoverflow.com/a/13670437 # т.к. 101км это первый проект и там уже много нахуеверчено, в том числе: bootstrap.min.js лежит в папке lib/, то эту строку комментируем (только для 101km)
#= require bootstrap/tooltip
#= require bootstrap/alert
#= require bootstrap/dropdown
#= require bootstrap-select

#= require_tree ./lib

#= require ./svg_elements/helper.js
#= require ./svg_elements/polygon.js
#= require ./svg_elements/area_label.js
#= require ./svg_elements/building_label.js

#= require_tree ./events
#= require_tree ./map_objects
#= require_tree ./view
#= require_tree ./buttons
#= require_tree ./ui

#= require ./src/utils/utils.js
#= require ./src/utils/opacity_buttons_utils.js
#= require ./src/utils/map_utils.js
#= require ./src/utils/i18n.js
#= require ./src/state_controller.js
#= require ./src/image_loader.js
#= require ./src/main.js