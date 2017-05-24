require 'rails_helper'
require 'search_result'

module C80MapFloors
  RSpec.describe AjaxHelper, type: :helper do

    let(:result) { SearchResult.new }

    context '#find_areas_by_shop!' do
      it 'Должен найти магазин "БРОСК"' do
        expected_result = {:buildings =>[3, 17], :buildings_shops_count =>[1, 1], :floors =>[6, 27], :floors_shops_count =>[1, 1], :areas =>[20, 181]}
        helper.find_areas_by_shop!(result, 'БРОСК (магазин)')
        expect(result.data).to eq expected_result
      end
    end

    context '#find_areas_by_category!' do
      it 'Должен найти категорию "метизы"' do
        expected_result = {:buildings=>[12, 3], :buildings_shops_count=>[1, 2], :floors=>[20, 6], :floors_shops_count=>[1, 2], :areas=>[114, 7, 11]}
        helper.find_areas_by_category!(result, 'метизы')
        expect(result.data).to eq expected_result
      end
    end

  end
end
