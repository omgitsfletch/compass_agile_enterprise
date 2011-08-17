module ErpApp
  class Engine < Rails::Engine
    isolate_namespace ErpApp
    
	initializer "erp_app_assets.merge_public" do |app|
      app.middleware.use ::ActionDispatch::Static, "#{root}/public"
    end
	  
	ActiveSupport.on_load(:active_record) do
      include ErpApp::Extensions::ActiveRecord::HasUserPreferences
      include ErpApp::Extensions::ActiveRecord::ActsAsAppContainer
    end
	  
	#add observer
	puts config.active_record.observers
	config.active_record.observers = :user_app_container_observer
	puts config.active_record.observers
	  
	 #set engine to scope
  	engine = self
  	config.to_prepare do 
  		#load extensions for engine
  		engine.load_extensions
  	end
  end
end
