CREATE TABLE IF NOT EXISTS `user` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `photo` TEXT NOT NULL,
  `address` TEXT NOT NULL,
  `doc` TEXT NOT NULL,
  `doc_type` ENUM('rg', 'cpf') NOT NULL,
  `enable` TINYINT (1) DEFAULT 1,
  PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `tournament` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `user_id` INT (20) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_tournament_user_id FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);
CREATE TABLE IF NOT EXISTS `player` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `photo` TEXT NULL,
  `email` TEXT NULL,
  `doc` TEXT NOT NULL,
  `doc_type` ENUM('rg', 'cpf') NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `tournament_player` (
  `tournament_id` INT (20) NOT NULL,
  `player_id` INT (20) NOT NULL,
  `point` INT (10) NULL,
  PRIMARY KEY (`tournament_id`, `player_id`),
  CONSTRAINT fk_tournament_player_tournament_id FOREIGN KEY (`tournament_id`) REFERENCES `tournament`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_player_player_id FOREIGN KEY (`player_id`) REFERENCES `player`(`id`)
);
CREATE TABLE IF NOT EXISTS `tournament_user` (
  `tournament_id` INT (20) NOT NULL,
  `user_id` INT (20) NOT NULL,
  `role` ENUM('admin', 'staff', 'judge') NULL,
  PRIMARY KEY (`tournament_id`, `player_id`),
  CONSTRAINT fk_tournament_user_tournament_id FOREIGN KEY (`tournament_id`) REFERENCES `tournament`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_user_user_id FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `phase` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `type` ENUM('group', 'quarter-final', 'semi-final', 'final') NOT NULL,
  `tournament_id` INT (20) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_phase_tournament_id FOREIGN KEY (`tournament_id`) REFERENCES `tournament`(`id`) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `game` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `type` ENUM('bof1', 'bof3', 'bof5', 'bof7') NOT NULL,
  `phase_id` INT (20) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_game_phase_id FOREIGN KEY (`phase_id`) REFERENCES `phase`(`id`) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `set` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `game_id` INT (20) NOT NULL,
  `player1_id` INT (20) NOT NULL,
  `player2_id` INT (20) NOT NULL,
  `player1_point` INT (5) NOT NULL,
  `player2_point` INT (5) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_set_game_id_id FOREIGN KEY (`phase_id`) REFERENCES `phase`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_set_player1_id FOREIGN KEY (`player1_id`) REFERENCES `player`(`id`),
  CONSTRAINT fk_set_player2_id FOREIGN KEY (`player2_id`) REFERENCES `player`(`id`)
);