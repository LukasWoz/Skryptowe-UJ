require 'sequel'

DB = Sequel.sqlite("products.db")

unless DB.table_exists?(:products)
  DB.create_table :products do
    primary_key :id
    String :keyword
    String :title
    Float  :price
    String :link, unique: false
    String :additional_info
    DateTime :created_at
  end
end

class Product < Sequel::Model(:products)
end