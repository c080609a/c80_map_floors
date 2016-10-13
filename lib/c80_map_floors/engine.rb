module C80MapFloors
  class Engine < ::Rails::Engine
    isolate_namespace C80MapFloors

    initializer :c80_map_floors do
      if defined?(ActiveAdmin)
        ActiveAdmin.application.load_paths += Dir["#{config.root}/app/models/**/"]
        #ActiveAdmin.application.load_paths += Dir["#{config.root}/app/models/concerns/**/"]
        ActiveAdmin.application.load_paths += Dir["#{config.root}/app/admin/c80_map_floors/**/"]
        # ActiveAdmin.application.load_paths += Dir["#{config.root}/app/jobs/**/"]
      end
    end

    initializer :append_migrations do |app|
      unless app.root.to_s.match root.to_s
        config.paths["db/migrate"].expanded.each do |expanded_path|
          app.config.paths["db/migrate"] << expanded_path
        end
      end
    end

  end
end
