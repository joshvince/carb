class QuestionController < ApplicationController
  def ask
  end

  def answer
    @ranking = Ranking.new(ip: request.remote_ip, **params_to_attributes)

    if @ranking.save
      redirect_to results_path
    end
  end

  def results
  end

  private

  def ranking_params
    params.permit(:position_1, :position_2, :position_3, :position_4, :position_5)
  end

  def params_to_attributes
    ranking_params.to_h.map { |key, value| [value, key.split('_').last.to_i] }.to_h
  end
end
