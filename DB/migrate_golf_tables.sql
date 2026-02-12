-- 전제: source DB(sveltt)가 이미 존재해야 함
-- 실행: mysql -uroot -p < migrate_golf_tables.sql

CREATE DATABASE IF NOT EXISTS `golf` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `golf`.`team_match_hole`;
DROP TABLE IF EXISTS `golf`.`team_match`;
DROP TABLE IF EXISTS `golf`.`hole_scores`;
DROP TABLE IF EXISTS `golf`.`rounds`;
DROP TABLE IF EXISTS `golf`.`team`;
DROP TABLE IF EXISTS `golf`.`course_holes`;
DROP TABLE IF EXISTS `golf`.`golf_courses`;
DROP TABLE IF EXISTS `golf`.`users`;

CREATE TABLE `golf`.`users` LIKE `sveltt`.`users`;
INSERT INTO `golf`.`users` SELECT * FROM `sveltt`.`users`;

CREATE TABLE `golf`.`golf_courses` LIKE `sveltt`.`golf_courses`;
INSERT INTO `golf`.`golf_courses` SELECT * FROM `sveltt`.`golf_courses`;

CREATE TABLE `golf`.`course_holes` LIKE `sveltt`.`course_holes`;
INSERT INTO `golf`.`course_holes` SELECT * FROM `sveltt`.`course_holes`;

CREATE TABLE `golf`.`rounds` LIKE `sveltt`.`rounds`;
INSERT INTO `golf`.`rounds` SELECT * FROM `sveltt`.`rounds`;

CREATE TABLE `golf`.`hole_scores` LIKE `sveltt`.`hole_scores`;
INSERT INTO `golf`.`hole_scores` SELECT * FROM `sveltt`.`hole_scores`;

CREATE TABLE `golf`.`team` LIKE `sveltt`.`team`;
INSERT INTO `golf`.`team` SELECT * FROM `sveltt`.`team`;

CREATE TABLE `golf`.`team_match` LIKE `sveltt`.`team_match`;
INSERT INTO `golf`.`team_match` SELECT * FROM `sveltt`.`team_match`;

CREATE TABLE `golf`.`team_match_hole` LIKE `sveltt`.`team_match_hole`;
INSERT INTO `golf`.`team_match_hole` SELECT * FROM `sveltt`.`team_match_hole`;

SET FOREIGN_KEY_CHECKS = 1;

-- 검증
SHOW TABLES FROM `golf`;
SELECT 'rounds' AS table_name, COUNT(*) AS cnt FROM `golf`.`rounds`
UNION ALL
SELECT 'team_match' AS table_name, COUNT(*) AS cnt FROM `golf`.`team_match`;
