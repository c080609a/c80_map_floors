require "babosa"

class Leaser < ActiveRecord::Base
  has_many :lphotos, dependent: :destroy
  has_and_belongs_to_many :categories

  # временно: чтобы работала страница "Аренда"
  has_many :checkins, dependent: :destroy
  has_many :areas, :through => :checkins

  # новое
  has_and_belongs_to_many :areas

  accepts_nested_attributes_for :lphotos,
                                :reject_if => lambda { |attributes|
                                  !attributes.present?
                                },
                                :allow_destroy => true

  validates :name,
            :presence => {message: "Укажите, пожалуйста, название арендатора."},
            :allow_blank => false,
            :allow_nil => false,
            :uniqueness => {message: "Арендатор с таким названием уже существует."}

  # mount_uploader :logotype, LeaserLogoUploader

  extend FriendlyId
  friendly_id :slug_candidates, :use => :slugged

  def slug_candidates
    [
        :name
    ]
  end

  def normalize_friendly_id(input)
    input.to_s.to_slug.normalize(transliterations: :russian).to_s
  end

  def order_name
    self.order(name: :asc)
  end

  def short_meta_description
    s = ''
    if full_desc.present?
      s = strip_tags(full_desc.html_safe[0..400])
      s.gsub!(/&[^;]+;/, '') # remove html entities
      s.gsub!(/%[^%]+%/, '') # remove my tags like %gallery..%
      s.gsub!("\n", ' ') # remove line breaks
      s.gsub!('  ', ' ')
    end
    s
  end

  def my_as_hash
    {
        id:             self.id,
        title:          self.name,
        desc:           self.short_meta_description,
        tel:            self.tel,
        site:           self.site,
        url:            "/#{self.slug}.html"
    }
  end

  def my_as_json8
    my_as_hash.as_json
  end

  def actual_logo_url
    if self.logotype.present?
      # noinspection RubyResolve
      img_src = self.logotype.thumb_slider.url
    elsif self.logo.present?
      img_src = self.logo
    else
      img_src = nil
    end
    img_src
  end

  # выдать названия тех магазинов, у которых есть площади
  def self.assigned_to_areas
    sql = 'SELECT
             `leasers`.`name`
           FROM `leasers`
             LEFT OUTER JOIN `areas_leasers` ON `areas_leasers`.`leaser_id` = `leasers`.`id`
           WHERE (`areas_leasers`.`area_id` IS NOT NULL)
           GROUP BY `leasers`.`name`;
    '
    records = ActiveRecord::Base.connection.execute(sql)
    records#.map { |e| e }.join(', ')

  end

end
