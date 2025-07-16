class Ranking < ApplicationRecord

  after_create :calculate_totals

  def calculate_totals
    Total.update_from_answer(self)
  end
end
