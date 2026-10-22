-- Run this in a TiDB Cloud Starter SQL Editor while connected to database `Food`.
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS food_analyses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  food_name VARCHAR(100) NOT NULL,
  food_group ENUM('Fruit', 'Vegetables', 'Milk products') NOT NULL,
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(8,2) NOT NULL,
  carbohydrates DECIMAL(8,2) NOT NULL,
  fats DECIMAL(8,2) NOT NULL,
  weight DECIMAL(8,2) NOT NULL,
  temperature DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT food_analyses_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX food_analyses_user_created_idx (user_id, created_at)
);
