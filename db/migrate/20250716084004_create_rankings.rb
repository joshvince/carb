class CreateRankings < ActiveRecord::Migration[8.0]
  def change
    create_table :rankings do |t|
      t.integer :bread
      t.integer :noodles
      t.integer :pasta
      t.integer :potato
      t.integer :rice
      t.string :ip

      t.timestamps
    end
  end
end
