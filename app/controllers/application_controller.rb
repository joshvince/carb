class ApplicationController < ActionController::Base
  # Allow browsers that support importmaps
  allow_browser versions: { safari: 16.4, firefox: 108, ie: false, edge: 89, chrome: 89 }

  def root
    if cookies[:enspuddification] == 'true'
      redirect_to results_path
    else
      redirect_to ask_path
    end
  end

  def ask
    render 'question/ask'
  end

  def answer
    if params[:enspuddification] == 'true'
      return redirect_to results_path
    end

    @ranking = Ranking.new(ip: request.remote_ip, **params_to_attributes)

    if @ranking.save
      request.flash[:newsflash] = 'true'
      # Set cookie with share text
      share_text = generate_share_text(@ranking)
      cookies[:share_text] = { value: share_text, expires: 1.hour.from_now }
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

    render 'question/results', locals:
  end

  def about
    enspuddification = cookies[:enspuddification] == 'true'
    @question_path = enspuddification ? ask_path(anchor: 'question') : ask_path

    render 'info/about'
  end

  private

  def ranking_params
    params.permit(:position_1, :position_2, :position_3, :position_4, :position_5, :enspuddification)
  end

  def params_to_attributes
    ranking_params.except(:enspuddification).to_h.map { |key, value| [value, key.split('_').last.to_i] }.to_h
  end

  def generate_share_text(ranking)
    # Create ranking array with position and carb name
    ranking_array = Array.new(5, '')

    # Build the ranking array with carb names instead of emojis
    ranking.attributes.slice('bread', 'noodles', 'pasta', 'potato', 'rice').each do |carb, position|
      if position && position > 0 && position <= 5
        ranking_array[position - 1] = carb
      end
    end

    # Return just the array as JSON
    ranking_array.to_json
  end
end
