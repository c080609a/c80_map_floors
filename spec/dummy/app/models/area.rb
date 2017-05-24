require 'babosa'
require 'c80_map_floors/area_representator' # только чтобы active_admin работал

class Area < ActiveRecord::Base
  belongs_to :floor

  after_update :calc_price_integer
  after_create :calc_price_integer

  after_update :copy_slug_to_tag
  after_create :copy_slug_to_tag

  # временно: чтобы работала страница "Аренда"
  has_one :checkin, :dependent => :destroy
  has_one :leaser, :through => :checkin

  # новое
  has_and_belongs_to_many :leasers

  has_one :sector
  has_many :aphotos, dependent: :destroy

  acts_as_map_area_representator

  scope :def_order, -> { order(:title => :asc) }

  accepts_nested_attributes_for :aphotos,
                                :reject_if => lambda { |attributes|
                                  !attributes.present?
                                },
                                :allow_destroy => true

  # validates :floor_id, :presence => {message: 'Какому этажу принадлежит павильон?'}

  validates :title,
            :presence => {message: 'Укажите, пожалуйста, название павильона.'},
            :allow_blank => false,
            :allow_nil => false

  validates_uniqueness_of :title,
                          :scope => :floor_id,
                          :message => 'Павильон с таким именем на этом этаже уже существует.'

  # TODO:: Excel: реализовать валидацию полей space и price, добавить вывод ошибок при импорте

  extend FriendlyId
  friendly_id :slug_candidates, :use => :slugged

  def slug_candidates
    [
        # :name,
        # [:name, :floor_id]
        # [Floor.find(self.floor_id).slug, :title]
        :title
    ]
  end

  def normalize_friendly_id(input)
    input.to_s.to_slug.normalize(transliterations: :russian).to_s
  end

  # вернуть строку вида "Здание №21: 1 этаж" (для админки, в чекбоксы)
  def parents_title
    res = '-'
    if floor.present?
      res = "#{floor.building_title}: #{floor.title}"
    end
    res
  end

  # свободна ли Площадь?
  def is_free?
    Rails.logger.debug "[TRACE] <area.is_free?> Свободна ли площадь id=#{self.id}? self.leasers.count = #{self.leasers.count}."
    res = true
    if self.leasers.count > 0
      res = false
    end
    res
  end

  def shop_as_hash
    res = nil
    if self.leasers.count > 0
      res = self.leasers.first.my_as_hash
    end
    res
  end

  def shop_as_json
    res = nil
    if self.leasers.count > 0
      res = self.leasers.first.my_as_json8
    end
    res
  end
  
  def self.to_csv(options = {})
    CSV.generate(options) do |csv|
      csv << column_names
      all.each do |product|
        csv << product.attributes.values_at(*column_names)
      end
    end
  end

  # http://stackoverflow.com/questions/5319400/want-to-find-records-with-no-associated-records-in-rails-3/5570221#5570221
  def self.free_areas
    Area.includes(:checkin).where(:checkins => {:area_id => nil})
  end

  def self.import(file)
    puts '------------------------------------------------------------- self.import [BEGIN] '
    import_result = ''
    spreadsheet = open_spreadsheet(file)
    header = spreadsheet.row(1)
    (2..spreadsheet.last_row).each do |i|

      row = Hash[ [header,spreadsheet.row(i)].transpose ]

      area_where = Area.where(:slug => row['ID'])
      if area_where.count > 0

        area = Area.where(:slug => row['ID']).first
        puts "--- Обновляем данные для #{area.id}, #{area.slug}: "
        puts '--- Хотим вставить данные: ' + row.to_hash.to_s
        area.price = row['Цена']
        area.space = row['Площадь']
        area.save
        puts '.'

      else
        s = "В базе не найден павильон: #{row.to_hash}"
        import_result += s + "\n"
        puts s

      end


    end
    puts '------------------------------------------------------------- self.import [END] '
    import_result
  end

=begin
  def self.import(file)
    CSV.foreach(file.path, headers: true) do |row|
      product = find_by_id(row["id"]) || new
      parameters = ActionController::Parameters.new(row.to_hash)
      product.update(parameters.permit(:name,:price))
      product.save!
    end
  end
=end

  # def self.import(file)
  #   allowed_attributes = [ "id","name","released_on","price","created_at","updated_at"]
  #   spreadsheet = open_spreadsheet(file)
  #   header = spreadsheet.row(1)
  #   (2..spreadsheet.last_row).each do |i|
  #     row = Hash[[header, spreadsheet.row(i)].transpose]
  #     product = find_by_id(row["id"]) || new
  #     product.attributes = row.to_hash.select { |k,v| allowed_attributes.include? k }
  #     product.save!
  #   end
  # end

  def self.open_spreadsheet(file)
    case File.extname(file.original_filename)
      when '.xls' then Roo::Excel.new(file.path)
      when '.xlsx' then Roo::Excelx.new(file.path)
      else raise "Неизвестный формат файла: #{file.original_filename}"
    end
  end

  def calc_price_integer
    if self.price_string.present?
      d = self.price_string.match '\d+'
      val = d.present? ? d[0].to_i : 0
      Rails.logger.debug "[TRACE] <area.calc_price_integer> title=`#{self.title}`: Рассчитаем цену-число из price_string=#{self.price_string}. Результат: #{val}."
      self.update_column(:price_integer, val)
    end
  end

  def copy_slug_to_tag
    s = self.slug
    self.update_column(:tag, s)
  end

end
