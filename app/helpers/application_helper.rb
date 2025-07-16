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

  def weighted_havoc_ratio_view_data(local_assigns)
    emojis = {
      bread: '🍞',
      noodles: '🍜',
      pasta: '🍝',
      potato: '🥔',
      rice: '🍚'
    }

    total_votes = local_assigns[:total_answers]

    local_assigns.slice(:bread, :noodles, :pasta, :potato, :rice).map do |key, value|
      havoc_ratio = total_votes > 0 ? (value.total_1.to_f / total_votes * 100).round(1) : 0
      { name: key.to_s.humanize, emoji: emojis[key], havoc_ratio: havoc_ratio }
    end.sort_by { |carb| -carb[:havoc_ratio] }
  end
end
