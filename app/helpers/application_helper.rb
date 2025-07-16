module ApplicationHelper
  def corrigan_score_view_data(local_assigns)
    emojis = {
      bread: '🍞',
      noodles: '🍜',
      pasta: '🍝',
      potato: '🥔',
      rice: '🍚'
    }

    local_assigns.slice(:bread, :noodles, :pasta, :potato, :rice).map do |key, value|
      { name: key.to_s.humanize, emoji: emojis[key], corrigan_score: value.total_score * 239 }
    end.sort_by { |carb| -carb[:corrigan_score] }
  end

  def calculate_percentage(value, total)
    total > 0 ? (value.to_f / total * 100).round(1) : 0
  end

  def calculate_score_percentage(score, max_score)
    max_score > 0 ? (score.to_f / max_score * 100).round(1) : 0
  end

  def ranking_label(position)
    case position
    when 1 then "1st"
    when 2 then "2nd"
    when 3 then "3rd"
    else "#{position}th"
    end
  end

  def first_place_percentage_label(percentage)
    "#{percentage}% ranked 1st"
  end

  def position_distribution_label(carb_total, position, total_answers)
    count = carb_total.public_send("total_#{position}")
    percentage = calculate_percentage(count, total_answers)
    "#{ranking_label(position)} #{percentage}%"
  end
end
