module C80MapFloors
  class ApplicationController < ActionController::Base
    protect_from_forgery with: :exception
    before_action :authenticate_admin_user!
  end
end