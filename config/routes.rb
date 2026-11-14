Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # ISOCRA moved to the Veni Vidi Vincey labs. The old host sends people there.
  constraints host: "isocra.joshvince.site" do
    get "(*path)", to: redirect { |_, request| "https://isocra.venividivincey.uk#{request.fullpath}" }
  end

  root "application#root"
  get "ask", to: "application#ask"
  post "answer", to: "application#answer"
  get "results", to: "application#results"
  get "about", to: "application#about"
end
