require 'bundler/setup'
require_relative 'amazon_scraper'
require_relative 'db_setup'
require 'date'

keyword = ARGV[0] || 'kindle'
limit = ARGV[1] ? ARGV[1].to_i : nil

scraper = AmazonScraper.new(keyword)
products = scraper.perform(limit)

puts "Scraped #{products.size} products for keyword: #{keyword}"

DB.transaction do
  products.each do |product_data|
      Product.create(
        keyword:         keyword,
        title:           product_data[:title],
        price:           product_data[:price],
        link:            product_data[:link],
        additional_info: product_data[:additional_info],
        created_at:      DateTime.now
      )
    
  end
end

puts "Data saved to database."
