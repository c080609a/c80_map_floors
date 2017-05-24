# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170518191906) do

  create_table "c80_contest_bids", force: :cascade do |t|
    t.string   "title",      limit: 255
    t.string   "photo",      limit: 255
    t.string   "phone",      limit: 255
    t.string   "comment",    limit: 255
    t.boolean  "marked"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "c80_contest_settings", force: :cascade do |t|
    t.string   "form_title",                limit: 255
    t.string   "form_label_name",           limit: 255
    t.string   "form_label_phone",          limit: 255
    t.string   "form_label_photo",          limit: 255
    t.string   "form_label_button_send",    limit: 255
    t.string   "form_label_button_sending", limit: 255
    t.string   "ok_text",                   limit: 255
    t.string   "ok_text_title",             limit: 255
    t.string   "admin_label_menu",          limit: 255
    t.text     "rules",                     limit: 65535
    t.string   "message_letter_subj",       limit: 255
    t.text     "message_text",              limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "admin_label_settings",      limit: 255
    t.string   "admin_label_bids",          limit: 255
    t.string   "mail_from",                 limit: 255
    t.string   "mail_to",                   limit: 255
    t.boolean  "is_active"
    t.string   "button_photo",              limit: 255
  end

end
