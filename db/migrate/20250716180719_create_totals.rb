class CreateTotals < ActiveRecord::Migration[8.0]
  def change
    create_table :totals do |t|
      t.string :carb
      t.integer :total_score, default: 0
      t.integer :total_1, default: 0
      t.integer :total_2, default: 0
      t.integer :total_3, default: 0
      t.integer :total_4, default: 0
      t.integer :total_5, default: 0

      t.timestamps
    end
  end
end
