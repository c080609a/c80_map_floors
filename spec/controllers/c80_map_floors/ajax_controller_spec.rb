require 'rails_helper'

module C80MapFloors
  RSpec.describe AjaxController, type: :controller do
    routes { Engine.routes }

    before do
      
      # allow(controller).to receive(:authenticate_admin_user!).and_return(true)
      class AjaxController
        def authenticate_admin_user!

        end
      end
    end

    context do
      it do
        post :find_shops, :params => {:stext => 'БРОСК (магазин)'}, :format => :json

      end
    end
  end
end
