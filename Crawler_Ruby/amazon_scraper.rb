require 'nokogiri'
require 'httparty'

class AmazonScraper
  BASE_URL = 'https://www.amazon.pl'

  def initialize(keyword)
    @keyword = keyword
  end

  def perform(limit = nil)
    url = "#{BASE_URL}/s?k=#{@keyword}"
    
    headers = {
      "User-Agent" => "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " \
                      "AppleWebKit/537.36 (KHTML, like Gecko) " \
                      "Chrome/112.0.5615.140 Safari/537.36"
    }

    response = HTTParty.get(url, headers: headers)
    
    puts "HTTP status: #{response.code}"

    parsed_page = Nokogiri::HTML(response.body)

    product_cards = parsed_page.css('.s-main-slot .s-result-item')

    puts "Found #{product_cards.size} product cards"

    cards = (limit && limit > 0) ? product_cards.take(limit+2) : product_cards

    results = []

    cards.each do |card|
        title_element = card.at_css('h2 span')
        next unless title_element
      
        title = title_element.text.strip
      
        link_element = card.at_css('a.a-link-normal')
        link = link_element ? (BASE_URL + link_element['href']) : nil
      
        raw_whole = card.at_css('.a-price-whole')&.text&.strip&.gsub(/[^\d]/, '')
        raw_fraction = card.at_css('.a-price-fraction')&.text&.strip&.gsub(/[^\d]/, '')
        if raw_whole && raw_fraction
            price = "#{raw_whole}.#{raw_fraction}"
        else
            price = raw_whole || nil
        end
        
        additional_info = link ? scrape_product_details(link, headers) : nil
      
        results << {
          title: title,
          link: link,
          price: price,
          additional_info: additional_info
        }
    end
      
    results
  end

  private

  def scrape_product_details(link, headers)
    sleep(rand(2..5))
    detail_response = HTTParty.get(link, headers: headers)
    parsed = Nokogiri::HTML(detail_response.body)
  
    details = []
  
    tech_details_table = parsed.at('#productDetails_techSpec_section_1')
    if tech_details_table
      tech_details_table.css('tr').each do |row|
        key = row.at_css('th.prodDetSectionEntry')&.text&.strip
        value = row.at_css('td.prodDetAttrValue')&.text&.strip
        
        next unless key && value
        
        clean_key = key.gsub(/[[:space:]]+/, ' ').delete("\u200E\u200F")
        clean_value = value.gsub(/[[:space:]]+/, ' ').delete("\u200E\u200F")
        
        details << "#{clean_key}: #{clean_value}"
      end
    end

    details.join(" | ")
  rescue => e
    puts "Błąd przy scrapowaniu #{link}: #{e.message}"
    nil
  end
  
end
