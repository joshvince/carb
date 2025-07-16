class QuestionController < ApplicationController
  def ask
  end

  def answer
    @ranking = Ranking.new(ip: request.remote_ip, **params_to_attributes)

    if @ranking.save
      redirect_to results_path
    else
      redirect_to ask_path, alert: 'Something went wrong. Please try again.'
    end
  end

  def results
    locals = {
      total_answers: Ranking.count,
      bread: Total.bread,
      noodles: Total.noodles,
      pasta: Total.pasta,
      potato: Total.potato,
      rice: Total.rice
    }

    render 'results', locals:
  end

  private

  def ranking_params
    params.permit(:position_1, :position_2, :position_3, :position_4, :position_5)
  end

  def params_to_attributes
    ranking_params.to_h.map { |key, value| [value, key.split('_').last.to_i] }.to_h
  end
end
