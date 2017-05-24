require "babosa"

class Category < ActiveRecord::Base
  has_and_belongs_to_many :leasers

  # before_validation :downcase_name

  default_scope { order(name: :asc) }

  validates :name,
            :presence => {message: "Укажите, пожалуйста, название."},
            :allow_blank => false,
            :allow_nil => false,
            :uniqueness => {
                :message => "Категория с таким названием уже существует."#,
                #:case_sensitive => false
            }

  extend FriendlyId
  friendly_id :name, use: :slugged

  def slug_candidates
    [
        :name
    ]
  end

  def normalize_friendly_id(input)
    input.to_s.to_slug.normalize(transliterations: :russian).to_s
  end

  # выдать только те категории, в которых есть хотя бы один арендатор
  def self.filled_cats
    Category.includes(:categories_leasers).where.not(:categories_leasers => {:leaser_id => nil})
  end

  # выдать категории, в которых нет никого
  def self.empty_cats
    Category.includes(:categories_leasers).where(:categories_leasers => {:leaser_id => nil})
  end

  # выдать count рандомных категорий (в виде массива)
  def self.get_random_cats(count)
    ccats = Array.new
    count.times do
      cat = Category.offset(rand(Category.count)).first
      ccats.push(cat)
    end
    ccats
  end

  # выдать столько категорий, чтобы их суммарное количество символов составляло N шт
  def self.get_row_cats(count)
    ccats = Array.new
    cat_names = ""

    fact_count = 0
    99.times do
      fact_count += 1
      # возьмём любую категорию
      cat = Category.offset(rand(Category.count)).first

      # если уже такую положили в массив-результат - перейдем к следующей итерации
      if ccats.include?(cat)
        next
      end

      # если категория пуста - пропускаем
      if cat.leasers.length == 0
        next
      end

      if cat_names.length + " #{cat.name}".length > count
        next

      elsif (cat_names.length - count).abs < 1
        break

      else
        ccats.push(cat)
        cat_names += " #{cat.name}"
      end

    end

    ccats
  end

=begin
  def name=(value)
    self[:name] = value.downcase
  end

  def before_save
    self[:name] = self[:name].downcase
  end

  private

  def downcase_name
     self.name = self.name.downcase if self.name.present?
  end
=end

end
