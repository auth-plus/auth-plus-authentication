-- migrate:up
START TRANSACTION;
CREATE DATABASE IF NOT EXISTS `tt_tournament` CHARACTER SET latin1;
CREATE TABLE IF NOT EXISTS `tt_tournament`.`user` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `salt` TEXT NOT NULL,
  `photo` TEXT NULL,
  `address` TEXT NULL,
  `doc` TEXT NULL,
  `doc_type` ENUM('rg', 'cpf') NULL,
  `token` TEXT NULL,
  `2factor` TEXT NULL,
  `player_id` INT (20) NULL,
  `enable` TINYINT (1) DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT unique_user_email UNIQUE (`email`)
);
CREATE TABLE IF NOT EXISTS `tt_tournament`.`tournament` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `type` ENUM("group-knockout", "knockout") NOT NULL,
  `user_id` INT (20) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_tournament_user_id FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);
CREATE TABLE IF NOT EXISTS `tt_tournament`.`player` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `photo` TEXT NULL,
  `email` TEXT NULL,
  `doc` TEXT NOT NULL,
  `doc_type` ENUM('rg', 'cpf') NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `tt_tournament`.`tournament_player` (
  `tournament_id` INT (20) NOT NULL,
  `player_id` INT (20) NOT NULL,
  `position` INT (6) NULL,
  PRIMARY KEY (`tournament_id`, `player_id`),
  CONSTRAINT fk_tournament_player_tournament_id FOREIGN KEY (`tournament_id`) REFERENCES `tournament`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_player_player_id FOREIGN KEY (`player_id`) REFERENCES `player`(`id`)
);
CREATE TABLE IF NOT EXISTS `tt_tournament`.`tournament_user` (
  `tournament_id` INT (20) NOT NULL,
  `user_id` INT (20) NOT NULL,
  `role` ENUM('admin', 'staff', 'judge') NULL,
  PRIMARY KEY (`tournament_id`, `user_id`),
  CONSTRAINT fk_tournament_user_tournament_id FOREIGN KEY (`tournament_id`) REFERENCES `tournament`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_tournament_user_user_id FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `tt_tournament`.`phase` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `type` ENUM(
    'group',
    'r16',
    'quarter-final',
    'semi-final',
    'final'
  ) NOT NULL,
  `tournament_id` INT (20) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_phase_tournament_id FOREIGN KEY (`tournament_id`) REFERENCES `tournament`(`id`) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `tt_tournament`.`phase_player` (
  `phase_id` INT (20) NOT NULL,
  `player_id` INT (20) NOT NULL,
  `point` INT (10) NULL,
  PRIMARY KEY (`phase_id`, `player_id`),
  CONSTRAINT fk_phase_player_phase_id FOREIGN KEY (`phase_id`) REFERENCES `phase`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_phase_player_player_id FOREIGN KEY (`player_id`) REFERENCES `player`(`id`)
);
CREATE TABLE IF NOT EXISTS `tt_tournament`.`game` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `type` ENUM('bof1', 'bof3', 'bof5', 'bof7') NOT NULL,
  `phase_id` INT (20) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_game_phase_id FOREIGN KEY (`phase_id`) REFERENCES `phase`(`id`) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS `tt_tournament`.`set` (
  `id` INT (20) NOT NULL AUTO_INCREMENT,
  `game_id` INT (20) NOT NULL,
  `player1_id` INT (20) NOT NULL,
  `player2_id` INT (20) NOT NULL,
  `player1_point` INT (5) NOT NULL,
  `player2_point` INT (5) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT fk_set_game_id FOREIGN KEY (`game_id`) REFERENCES `game`(`id`) ON DELETE CASCADE,
  CONSTRAINT fk_set_player1_id FOREIGN KEY (`player1_id`) REFERENCES `player`(`id`),
  CONSTRAINT fk_set_player2_id FOREIGN KEY (`player2_id`) REFERENCES `player`(`id`)
);
INSERT IGNORE INTO `tt_tournament`.`user`(
    `name`,
    `email`,
    `password`,
    `salt`,
    `enable`
  )
VALUES
  (
    "admin",
    "admin@3t.com",
    "5B4114F6CF0B4F808A5CAC5157BEA424562AFDEDA306E2BE1AA84A288E253679",
    "andrew",
    1
  );
COMMIT;
-- migrate:down
  START TRANSACTION;
DELETE FROM `tt_tournament`.`user`
WHERE
  `name` = "admin";
DROP TABLE `tt_tournament`.`set`;
DROP TABLE `tt_tournament`.`game`;
DROP TABLE `tt_tournament`.`phase_player`;
DROP TABLE `tt_tournament`.`phase`;
DROP TABLE `tt_tournament`.`tournament_user`;
DROP TABLE `tt_tournament`.`tournament_player`;
DROP TABLE `tt_tournament`.`player`;
DROP TABLE `tt_tournament`.`tournament`;
DROP TABLE `tt_tournament`.`user`;
DROP DATABASE `tt_tournament`;
COMMIT;