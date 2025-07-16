class Total < ApplicationRecord

  scope :bread, -> { find_by(carb: 'bread') }
  scope :noodles, -> { find_by(carb: 'noodles') }
  scope :pasta, -> { find_by(carb: 'pasta') }
  scope :potato, -> { find_by(carb: 'potato') }
  scope :rice, -> { find_by(carb: 'rice') }

  def self.update_from_answer(ranking)
    bread.update_from_answer(ranking, :bread)
    noodles.update_from_answer(ranking, :noodles)
    pasta.update_from_answer(ranking, :pasta)
    potato.update_from_answer(ranking, :potato)
    rice.update_from_answer(ranking, :rice)
  end

  def update_from_answer(ranking, carb_symbol)
    self.total_score += score_from_position(ranking.public_send(carb_symbol))
    self.total_1 += 1 if ranking.public_send(carb_symbol) == 1
    self.total_2 += 1 if ranking.public_send(carb_symbol) == 2
    self.total_3 += 1 if ranking.public_send(carb_symbol) == 3
    self.total_4 += 1 if ranking.public_send(carb_symbol) == 4
    self.total_5 += 1 if ranking.public_send(carb_symbol) == 5

    self.save!
  end

  def score_from_position(position)
    scores = [5, 4, 3, 2, 1]
    scores[position - 1]
  end
end
